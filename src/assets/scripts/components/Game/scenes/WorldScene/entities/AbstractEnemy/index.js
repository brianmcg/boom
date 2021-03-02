import { CELL_SIZE, UPDATE_DISTANCE } from 'game/constants/config';
import AbstractActor from '../AbstractActor';

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

const FORCE_FADE = 0.8;

const MIN_FORCE = 0.1;

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
   * @param  {Number} options.attackRange     The attack range of the enemy.
   * @param  {Number} options.attackTime      The time between attacks.
   * @param  {Number} options.hurtTime        The time the enemy remains hurt when hit.
   * @param  {Number} options.alerTime        The time before attacking adter alert.
   * @param  {Number} options.acceleration    The acceleration of the enemy.
   */
  constructor({
    attackRange = 2,
    attackTime = 1000,
    hurtTime = 1000,
    alertTime = 1000,
    aimTime = 200,
    maxAttacks,
    spatters,
    spatterOffset,
    explosionType,
    isFloating,
    primaryAttack,
    proneHeight,
    type,
    spatterType,
    ...other
  }) {
    super(other);

    if (this.constructor === AbstractEnemy) {
      throw new TypeError('Can not construct abstract class.');
    }

    this.attackRange = attackRange * CELL_SIZE;
    this.explosionType = explosionType;
    this.type = type;
    this.spatters = spatters;
    this.spatterOffset = spatterOffset;
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
    this.isFloating = isFloating;
    this.floatDirection = 1;
    this.proneHeight = proneHeight;
    this.primaryAttack = primaryAttack;
    this.spatterType = spatterType;

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
      if (this.isFloating) {
        this.z += FLOAT_INCREMENT * this.floatDirection * delta;

        if (Math.abs(this.z) >= FLOAT_BOUNDARY) {
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
  updateIdle() {
    if (this.findPlayer()) {
      this.setAlerted();
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
        if (this.distanceToPlayer <= this.attackRange) {
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
      if (this.distanceToPlayer <= this.attackRange) {
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
      if (this.distanceToPlayer <= this.attackRange) {
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
      if (this.distanceToPlayer <= this.attackRange) {
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

    if (this.velocity <= MIN_FORCE) {
      this.velocity = 0;
    }

    if (this.velocity === 0) {
      this.blocking = false;
      this.parent.stopUpdates(this);
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
    const { distance } = this.castRay();
    const { player } = this.parent;

    this.face(player);

    return player.isAlive() && distance > this.distanceToPlayer;
  }

  /**
   * Hurt the enemy
   * @param  {Number} damage The damage to health.
   */
  hurt(damage, angle = 0) {
    if (this.isAlive()) {
      this.health -= damage;

      if (this.health > 0) {
        this.setHurting();
      } else {
        this.angle = angle;
        this.velocity = damage * 0.1;
        this.setDead();
      }
    }
  }

  /**
   * Get the type of blood spatter.
   * @return {Number} The type of blood spatter.
   */
  spatter() {
    return Math.floor(Math.random() * this.spatters) + this.spatterOffset;
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
    const isStateChangedd = this.setState(STATES.ALERTED);

    if (isStateChangedd) {
      this.emitSound(this.sounds.alert);
    }
  }

  /**
   * Set the enemy to the patrolling state.
   * @return {Boolean}  State change successful.
   */
  setPatrolling() {
    const cells = this.parent.getAdjacentCells(this)
      .filter(s => !s.blocking && !s.bodies.length && s !== this.waypoint);

    if (cells.length) {
      const index = Math.floor(Math.random() * cells.length);
      const cell = cells[index];
      this.waypoint = cell;
    } else {
      this.waypoint = this.cell;
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
      if (this.explosionType) {
        this.parent.addEffect({
          x: this.x,
          y: this.y,
          z: this.z,
          sourceId: `${this.id}_${this.explosionType}`,
        });
      } else {
        this.isProne = true;
      }

      this.emitSound(this.sounds.death);
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
}

export default AbstractEnemy;
