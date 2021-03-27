import { CELL_SIZE, UPDATE_DISTANCE } from 'game/constants/config';
import AbstractActor from '../AbstractActor';
import Explosion from '../Explosion';

const STATES = {
  IDLE: 'enemy:idle',
  ALERTED: 'enemy:alerted',
  PATROLLING: 'enemy:patrolling',
  CHASING: 'enemy:chasing',
  AIMING: 'enemy:aiming',
  ATTACKING: 'enemy:attacking',
  HURTING: 'enemy:hurting',
  DEAD: 'enemy:dead',
};

const WAYPOINT_SIZE = CELL_SIZE / 4;

const FLOAT_INCREMENT = 0.075;

const FLOAT_BOUNDARY = 4;

const FORCE_FADE = 0.85;

const MIN_FORCE = 0.1;

const NEARBY = CELL_SIZE * 6;

const GROWL_INTERVAL = 8000;

const DEAD_VELOCITY_MULTIPLIER = 0.25;

/**
 * Abstract class representing an enemy.
 * @extends {AbstractActor}
 */
class AbstractEnemy extends AbstractActor {
  /**
   * Creates an abstract enemy.
   * @param  {Number} options.x               The x coordinate of the character.
   * @param  {Number} options.y               The y coordinate of the character
   * @param  {Number} options.width           The width of the character.
   * @param  {Number} options.height          The height of the character.
   * @param  {Number} options.angle           The angle of the character.
   * @param  {Number} options.maxHealth       The maximum health of the character.
   * @param  {Number} options.speed           The maximum speed of the enemy.
   * @param  {Number} options.stateDurations  The time to stay in a state.
   * @param  {Number} options.acceleration    The acceleration of the enemy.
   */
  constructor({
    stateDurations,
    maxAttacks,
    float,
    primaryAttack,
    proneHeight,
    explosion,
    type,
    ...other
  }) {
    super(other);

    if (this.constructor === AbstractEnemy) {
      throw new TypeError('Can not construct abstract class.');
    }

    const {
      attack: attackTime = 1000,
      hurt: hurtTime = 1000,
      alert: alertTime = 1000,
      aim: aimTime = 200,
    } = stateDurations;

    this.type = type;
    this.attackTime = attackTime;
    this.hurtTime = hurtTime;
    this.alertTime = alertTime;
    this.aimTime = aimTime;
    this.maxAttacks = maxAttacks;
    this.numberOfAttacks = maxAttacks;
    this.attackTimer = 0;
    this.hurtTimer = 0;
    this.alertTimer = 0;
    this.aimTimer = 0;
    this.isEnemy = true;
    this.float = float;
    this.floatDirection = 1;
    this.floatAmount = 0;
    this.proneHeight = proneHeight;
    this.nearbyTimer = 0;

    this.primaryAttack = {
      ...primaryAttack,
      range: primaryAttack.range * CELL_SIZE,
    };

    if (explosion) {
      this.explosion = new Explosion({ source: this, ...explosion });
    }

    this.setIdle();
  }

  /**
   * Update the enemy.
   * @param  {Number} delta The delta time.
   * @param  {Number} elapsedMS The elapsed time.
   */
  update(delta, elapsedMS = 1) {
    super.update(delta, elapsedMS);

    if (this.distanceToPlayer < UPDATE_DISTANCE) {
      if (this.float) {
        this.floatAmount += FLOAT_INCREMENT * this.floatDirection * delta;

        if (Math.abs(this.floatAmount) >= FLOAT_BOUNDARY) {
          this.floatDirection *= -1;
        }
      }

      switch (this.state) {
        case STATES.IDLE:
          this.updateIdle(delta, elapsedMS);
          break;
        case STATES.ALERTED:
          this.updateAlerted(delta, elapsedMS);
          break;
        case STATES.PATROLLING:
          this.updatePatrolling(delta, elapsedMS);
          break;
        case STATES.CHASING:
          this.updateChasing(delta, elapsedMS);
          break;
        case STATES.AIMING:
          this.updateAiming(delta, elapsedMS);
          break;
        case STATES.ATTACKING:
          this.updateAttacking(delta, elapsedMS);
          break;
        case STATES.HURTING:
          this.updateHurting(delta, elapsedMS);
          break;
        case STATES.DEAD:
          this.updateDead(delta, elapsedMS);
          break;
        default:
          break;
      }
    }
  }

  /**
   * Update enemy in idle state
   */
  updateIdle(delta, elapsedMS) {
    if (this.findPlayer()) {
      this.setAlerted();
    } else {
      this.nearbyTimer += elapsedMS;

      if (this.nearbyTimer > GROWL_INTERVAL) {
        this.nearbyTimer = 0;
      }

      if (this.nearbyTimer === 0 && this.distanceToPlayer < NEARBY) {
        this.emitSound(this.sounds.nearby);
      }
    }
  }

  /**
   * Update enemy in the alerted state.
   * @param  {Number} delta The delta time.
   */
  updateAlerted(delta, elapsedMS) {
    if (this.findPlayer()) {
      this.alertTimer += elapsedMS;

      if (this.alertTimer >= this.alertTime) {
        if (this.distanceToPlayer <= this.primaryAttack.range) {
          this.setAiming();
        } else {
          this.setChasing();
        }
      }
    } else {
      this.setPatrolling();
    }
  }

  /**
   * Update enemy in chasing state
   */
  updateChasing() {
    if (this.findPlayer()) {
      if (this.distanceToPlayer <= this.primaryAttack.range) {
        this.setAiming();
      }
    } else {
      this.setPatrolling();
    }
  }

  /**
   * Update the enemy in the patrolling state.
   */
  updatePatrolling() {
    if (
      Math.abs(this.x - this.waypoint.x) <= WAYPOINT_SIZE
        && Math.abs(this.x - this.waypoint.x) <= WAYPOINT_SIZE
    ) {
      if (this.findPlayer()) {
        this.setChasing();
      } else {
        this.setIdle();
        this.setPatrolling();
      }
    } else {
      this.face(this.waypoint);
    }
  }

  /**
   * Update enemy in aiming state
   * @param  {Number} delta The delta time.
   */
  updateAiming(delta, elapsedMS) {
    if (this.findPlayer()) {
      if (this.distanceToPlayer <= this.primaryAttack.range) {
        this.aimTimer += elapsedMS;

        if (this.aimTimer >= this.aimTime) {
          this.setAttacking();
        }
      } else {
        this.setChasing();
      }
    } else {
      this.setPatrolling();
    }
  }

  /**
   * Update enemy in attacking state
   * @param  {Number} delta The delta time.
   */
  updateAttacking(delta, elapsedMS) {
    if (this.findPlayer()) {
      if (this.distanceToPlayer <= this.primaryAttack.range) {
        this.attackTimer += elapsedMS;

        if (this.attackTimer >= this.attackTime) {
          if (this.numberOfAttacks < 1) {
            this.numberOfAttacks = this.maxAttacks;
            this.setPatrolling();
          } else {
            this.onAttackComplete();
          }
        }
      } else {
        this.setChasing();
      }
    } else {
      this.setPatrolling();
    }
  }

  /**
   * Update enemy in hurt state
   * @param  {Number} delta The delta time.
   */
  updateHurting(delta, elapsedMS) {
    this.hurtTimer += elapsedMS;

    if (this.hurtTimer >= this.hurtTime) {
      this.onHurtComplete();
    }
  }

  /**
   * Update enemy in hurt state
   * @param  {Number} delta The delta time.
   */
  updateDead() {
    this.velocity *= FORCE_FADE;
    this.z = 0;
    this.floatAmount = 0;

    if (this.velocity <= MIN_FORCE) {
      this.velocity = 0;
    }

    if (this.velocity === 0) {
      this.blocking = false;
      this.stopUpdates();
    }
  }

  /**
   * Attack a target.
   */
  attack() {
    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement this method.');
    }
  }

  /**
   * Execute completed attack behavior.
   */
  onAttackComplete() {
    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement this method.');
    }
  }

  /**
   * Execute recovery behaviour.
   */
  onHurtComplete() {
    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement this method.');
    }
  }

  /**
   * Try and locate the player
   * @return {Boolean} Was the player located.
   */
  findPlayer() {
    const { player } = this.parent;

    this.face(player);

    const { distance, encounteredBodies } = this.castRay();

    return encounteredBodies[player.id]
      && player.isAlive()
      && distance > this.distanceToPlayer;
  }

  /**
   * Hurt the enemy
   * @param  {Number} damage The damage to health.
   * @param  {Number} angle  The angle the damage came from.
   */
  hurt(damage, angle = 0) {
    super.hurt(damage, angle);

    if (this.isAlive()) {
      this.health -= damage;

      if (this.health > 0) {
        this.setHurting();
      } else {
        this.angle = angle;
        this.velocity = Math.sqrt(damage);
        this.setDead();
      }
    } else {
      this.angle = angle;
      this.velocity = Math.sqrt(damage) * DEAD_VELOCITY_MULTIPLIER;
    }
  }

  /**
   * Add a callback to the idle state change.
   * @param  {Function} callback The callback function.
   */
  onIdle(callback) {
    this.on(STATES.IDLE, callback);
  }

  /**
   * Add a callback to the alerted state change.
   * @param  {Function} callback The callback function.
   */
  onAlerted(callback) {
    this.on(STATES.ALERTED, callback);
  }

  /**
   * Add a callback to the patrolling state change.
   * @param  {Function} callback The callback function.
   */
  onPatrolling(callback) {
    this.on(STATES.PATROLLING, callback);
  }

  /**
   * Add a callback to the idle moving change.
   * @param  {Function} callback The callback function.
   */
  onChasing(callback) {
    this.on(STATES.CHASING, callback);
  }

  /**
   * Add a callback to the idle aiming change.
   * @param  {Function} callback The callback function.
   */
  onAiming(callback) {
    this.on(STATES.AIMING, callback);
  }

  /**
   * Add a callback to the idle attacking change.
   * @param  {Function} callback The callback function.
   */
  onAttacking(callback) {
    this.on(STATES.ATTACKING, callback);
  }

  /**
   * Add a callback to the idle hurting change.
   * @param  {Function} callback The callback function.
   */
  onHurting(callback) {
    this.on(STATES.HURTING, callback);
  }

  /**
   * Add a callback to the idle dead change.
   * @param  {Function} callback The callback function.
   */
  onDead(callback) {
    this.on(STATES.DEAD, callback);
  }

  /**
   * Set the enemy to the idle state.
   * @return {Boolean}  State change successful.
   */
  setIdle() {
    const isStateChanged = this.setState(STATES.IDLE);

    if (isStateChanged) {
      this.velocity = 0;
    }

    return isStateChanged;
  }

  /**
   * Set the enemy to the alerted state.
   * @return {Boolean}  State change successful.
   */
  setAlerted() {
    const isStateChanged = this.setState(STATES.ALERTED);

    if (isStateChanged) {
      this.emitSound(this.sounds.alert);
    }
  }

  /**
   * Set the enemy to the patrolling state.
   * @return {Boolean}  State change successful.
   */
  setPatrolling() {
    const { player } = this.parent;

    const cells = this.parent.getAdjacentCells(this)
      // && cell !== this.waypoint
      .filter(cell => !cell.blocking && !cell.bodies.some(b => b.blocking))
      .sort((a, b) => {
        const distanceA = player.getDistanceTo(a);
        const distanceB = player.getDistanceTo(b);

        if (distanceA > distanceB) {
          return 1;
        }

        if (distanceA < distanceB) {
          return -1;
        }

        return 0;
      });

    if (cells.length) {
      this.waypoint = cells[0];
    } else {
      this.setIdle();
      // this.waypoint = this.cell;
    }

    this.velocity = this.speed;

    return this.setState(STATES.PATROLLING);
  }

  /**
   * Set the enemy to the moving state.
   * @return {Boolean}  State change successful.
   */
  setChasing() {
    this.velocity = this.speed;
    return this.setState(STATES.CHASING);
  }

  /**
   * Set the enemy to the aiming state.
   * @return {Boolean}  State change successful.
   */
  setAiming() {
    this.velocity = 0;
    return this.setState(STATES.AIMING);
  }

  /**
   * Set the enemy to the attacking state.
   * @return {Boolean}  State change successful.
   */
  setAttacking() {
    const isStateChanged = this.setState(STATES.ATTACKING);

    if (isStateChanged) {
      this.attack();
      this.numberOfAttacks -= 1;
      this.velocity = 0;
    }

    return isStateChanged;
  }

  /**
   * Set the enemy to the hurting state.
   * @return {Boolean}  State change successful.
   */
  setHurting() {
    const isStateChanged = this.setState(STATES.HURTING);

    if (isStateChanged) {
      this.velocity = 0;

      if (!this.isPlaying(this.sounds.pain)) {
        this.emitSound(this.sounds.pain);
      }
    }

    return isStateChanged;
  }

  /**
   * Set the enemy to the dead state.
   * @return {Boolean}  State change successful.
   */
  setDead() {
    const isStateChanged = this.setState(STATES.DEAD);

    if (isStateChanged) {
      if (this.explosion) {
        this.explosion.run();
      } else {
        this.isProne = true;
      }

      if (this.sounds.death) {
        this.emitSound(this.sounds.death);
      }
    }

    return isStateChanged;
  }

  /**
   * Is the enemy in the idle state.
   * @return {Boolean}
   */
  isIdle() {
    return this.state === STATES.IDLE;
  }

  /**
   * Is the enemy in the alerted state.
   * @return {Boolean}
   */
  isAlerted() {
    return this.state === STATES.ALERTED;
  }

  /**
   * Is the enemy in the patrolling state.
   * @return {Boolean} [description]
   */
  isPatrolling() {
    return this.state === STATES.PATROLLING;
  }

  /**
   * Is the enemy in the chasing state.
   * @return {Boolean}
   */
  isChasing() {
    return this.state === STATES.CHASING;
  }

  /**
   * Is the enemy in the aiming state.
   * @return {Boolean}
   */
  isAiming() {
    return this.state === STATES.AIMING;
  }

  /**
   * Is the enemy in the attacking state.
   * @return {Boolean}
   */
  isAttacking() {
    return this.state === STATES.ATTACKING;
  }

  /**
   * Is the enemy in the hurt state.
   * @return {Boolean}
   */
  isHurting() {
    return this.state === STATES.HURTING;
  }

  /**
   * Is the enemy in the dead state.
   * @return {Boolean}
   */
  isDead() {
    return this.state === STATES.DEAD;
  }

  /**
   * Is the enemy alive.
   * @return {Boolean}
   */
  isAlive() {
    return this.state !== STATES.DEAD;
  }

  attackDamage() {
    const { power, accuracy } = this.primaryAttack;

    return power * (Math.floor(Math.random() * accuracy) + 1);
  }

  /**
   * Set the state.
   * @param {String} state The new state.
   */
  setState(state) {
    const isStateChanged = super.setState(state);

    if (isStateChanged) {
      this.attackTimer = 0;
      this.hurtTimer = 0;
      this.alertTimer = 0;
      this.aimTimer = 0;
      this.emit(state);
    }

    return isStateChanged;
  }

  /**
   * The elavation.
   * @member {Number}
   */
  get elavation() {
    return this.z + this.floatAmount;
  }
}

export default AbstractEnemy;
