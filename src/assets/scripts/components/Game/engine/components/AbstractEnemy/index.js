import { degrees } from 'game/core/physics';
import { CELL_SIZE, UPDATE_DISTANCE } from 'game/constants/config';
import AbstractActor from '../AbstractActor';
import Explosion from '../Explosion';

const STATES = {
  IDLE: 'enemy:idle',
  ALERTED: 'enemy:alerted',
  EVADING: 'enemy:evading',
  CHASING: 'enemy:chasing',
  AIMING: 'enemy:aiming',
  ATTACKING: 'enemy:attacking',
  HURTING: 'enemy:hurting',
  DEAD: 'enemy:dead',
};

const FLOAT_INCREMENT = 0.075;

const FLOAT_BOUNDARY = 4;

const FORCE_FADE = 0.85;

const MIN_FORCE = 0.1;

const NEARBY = CELL_SIZE * 6;

const GROWL_INTERVAL = 8000;

const DEAD_VELOCITY_MULTIPLIER = 0.25;

const SEARCH_INTERVAL = 500;

const DEG_90 = degrees(90);

const DEG_360 = degrees(360);

const MAX_STAIN_RADIUS = CELL_SIZE / 4;

const STAIN_INTERVAL = 50;

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

    this.path = [];

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
        case STATES.EVADING:
          this.updateEvading(delta, elapsedMS);
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
    this.target = this.findPlayer();

    if (this.target) {
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
    this.target = this.parent.player;

    this.alertTimer += elapsedMS;

    if (this.alertTimer >= this.alertTime) {
      if (this.distanceToPlayer <= this.primaryAttack.range) {
        this.setAiming();
      } else {
        this.setChasing();
      }
    }
  }

  /**
   * Update enemy in chasing state
   */
  updateChasing(delta, elapsedMS) {
    this.target = this.findPlayer();

    if (this.target && this.distanceToPlayer <= this.primaryAttack.range) {
      this.setAiming();
    } else {
      const next = this.path[0];

      this.searchTimer += elapsedMS;

      if (this.searchTimer >= SEARCH_INTERVAL) {
        this.searchTimer = 0;

        if (this.target) {
          this.path = this.parent.findPath(this, this.target);
        }
      }

      if (next) {
        this.face(next);

        if (next.isDoor) {
          next.use(this);
        }

        if (this.isArrivedAt(next)) {
          this.path.shift();
        }
      } else if (this.target) {
        this.path = this.parent.findPath(this, this.target);
      } else {
        this.setIdle();
      }
    }
  }

  /**
   * Update the enemy in the evading state.
   */
  updateEvading() {
    if (this.isArrivedAt(this.evadeDestination)) {
      this.target = this.parent.player;
      this.setChasing();
    } else {
      this.face(this.evadeDestination);
    }
  }

  /**
   * Update enemy in aiming state
   * @param  {Number} delta The delta time.
   */
  updateAiming(delta, elapsedMS) {
    this.target = this.findPlayer();

    if (this.target) {
      if (this.distanceToPlayer <= this.primaryAttack.range) {
        this.aimTimer += elapsedMS;

        if (this.aimTimer >= this.aimTime) {
          this.setAttacking();
        }
      } else {
        this.setChasing();
      }
    } else {
      this.target = this.parent.player;
      this.setChasing();
    }
  }

  /**
   * Update enemy in attacking state
   * @param  {Number} delta The delta time.
   */
  updateAttacking(delta, elapsedMS) {
    this.target = this.findPlayer();

    if (this.target) {
      if (this.distanceToPlayer <= this.primaryAttack.range) {
        this.attackTimer += elapsedMS;

        if (this.attackTimer >= this.attackTime) {
          if (this.numberOfAttacks < 1) {
            this.numberOfAttacks = this.maxAttacks;
            this.setEvading();
          } else {
            this.onAttackComplete();
          }
        }
      } else {
        this.setChasing();
      }
    } else {
      this.target = this.parent.player;
      this.setChasing();
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
  updateDead(delta, elapsedMS) {
    this.velocity *= FORCE_FADE;
    this.z = 0;
    this.floatAmount = 0;

    if (this.velocity <= MIN_FORCE) {
      this.velocity = 0;
    }

    if (this.parent.floorOffset) {
      if (this.velocity === 0) {
        this.stopUpdates();
        this.blocking = false;
      }
    } else {
      this.stainTimer += elapsedMS;

      if (this.stainTimer > STAIN_INTERVAL) {
        this.stainTimer = 0;

        if (this.stainRadius <= MAX_STAIN_RADIUS) {
          this.stain(this.stainRadius);
          this.stainRadius += 2;
        }
      }

      if (this.velocity === 0) {
        this.stain(MAX_STAIN_RADIUS);
        this.stopUpdates();
        this.blocking = false;
      }
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

    if (
      encounteredBodies[player.id]
        && player.isAlive()
        && distance > this.distanceToPlayer
    ) {
      return player;
    }

    return null;
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
   * Add a callback to the evading state change.
   * @param  {Function} callback The callback function.
   */
  onEvading(callback) {
    this.on(STATES.EVADING, callback);
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
   * Set the enemy to the evading state.
   * @return {Boolean}  State change successful.
   */
  setEvading() {
    const isStateChanged = this.setState(STATES.EVADING);

    if (isStateChanged) {
      const { player } = this.parent;

      // Randomly pick an right angle to the left or right and
      // get x and y grid coordinates, to priorities lateral evasion.
      const angleOffset = Math.round(Math.random()) ? DEG_90 : -DEG_90;
      const angle = (this.angle + angleOffset + DEG_360) % DEG_360;
      const x = Math.floor((this.x + Math.cos(angle) * CELL_SIZE) / CELL_SIZE);
      const y = Math.floor((this.y + Math.sin(angle) * CELL_SIZE) / CELL_SIZE);

      // Get cell to move to, prioritizing the x and y grid cooridinates above
      // and getting the cell nearest to player, if left or right not free.
      this.evadeDestination = this.parent.getAdjacentCells(this).reduce((memo, cell) => {
        if (!cell.blocking && !cell.bodies.some(b => b.blocking)) {
          if (!memo) {
            return cell;
          }

          if (cell.gridX === x && cell.gridY === y) {
            return cell;
          }

          if (player.getDistanceTo(cell) < player.getDistanceTo(memo)) {
            return cell;
          }

          return memo;
        }

        return memo;
      }, null);

      if (!this.evadeDestination) {
        this.setIdle();
      }

      this.velocity = this.speed;
    }

    return isStateChanged;
  }

  /**
   * Set the enemy to the moving state.
   * @return {Boolean}  State change successful.
   */
  setChasing() {
    const isStateChanged = this.setState(STATES.CHASING);

    if (isStateChanged) {
      this.velocity = this.speed;

      if (this.target) {
        this.path = this.parent.findPath(this.cell, this.target);
      }
    }

    return isStateChanged;
  }

  /**
   * Set the enemy to the aiming state.
   * @return {Boolean}  State change successful.
   */
  setAiming() {
    const isStateChanged = this.setState(STATES.AIMING);

    if (isStateChanged) {
      this.velocity = 0;
    }

    return isStateChanged;
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
      this.stainTimer = 0;
      this.stainRadius = 1;

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
   * Is the enemy in the evading state.
   * @return {Boolean} [description]
   */
  isEvading() {
    return this.state === STATES.EVADING;
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
      this.searchTimer = 0;
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
