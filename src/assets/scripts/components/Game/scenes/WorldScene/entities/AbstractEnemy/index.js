import { CELL_SIZE, UPDATE_DISTANCE, TIME_STEP } from 'game/constants/config';
import AbstractActor from '../AbstractActor';

const STATES = {
  IDLE: 'enemy:idle',
  ALERTED: 'enemy:alerted',
  CHASING: 'enemy:chasing',
  AIMING: 'enemy:aiming',
  ATTACKING: 'enemy:attacking',
  HURTING: 'enemy:hurting',
  DEAD: 'enemy:dead',
  PATROLLING: 'enemy:patrolling',
};

const WAYPOINT_SIZE = CELL_SIZE / 4;

const FLOAT_INCREMENT = 0.075;

const FLOAT_BOUNDARY = 4;

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
    attackPower = 1,
    maxAttacks,
    spatters,
    spatterType,
    corpseRemains,
    isFloating,
    type,
    ...other
  }) {
    super(other);

    if (this.constructor === AbstractEnemy) {
      throw new TypeError('Can not construct abstract class.');
    }

    this.attackRange = attackRange * CELL_SIZE;
    this.corpseRemains = corpseRemains;
    this.type = type;
    this.spatterType = spatterType;
    this.spatters = spatters;
    this.attackTime = attackTime;
    this.hurtTime = hurtTime;
    this.alertTime = alertTime;
    this.aimTime = aimTime;
    this.attackPower = attackPower;
    this.maxAttacks = maxAttacks;
    this.numberOfAttacks = maxAttacks;
    this.distanceToPlayer = Number.MAX_VALUE;
    this.attackTimer = 0;
    this.hurtTimer = 0;
    this.alertTimer = 0;
    this.aimTimer = 0;
    this.isEnemy = true;
    this.isFloating = isFloating;
    this.floatDirection = 1;

    this.setIdle();
  }

  /**
   * Update the enemy.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    const { player } = this.parent;

    this.distanceToPlayer = this.getDistanceTo(player);

    if (this.distanceToPlayer < UPDATE_DISTANCE) {
      if (this.isFloating) {
        this.z += FLOAT_INCREMENT * this.floatDirection * delta;

        if (Math.abs(this.z) >= FLOAT_BOUNDARY) {
          this.floatDirection *= -1;
        }
      }

      this.face(player);

      switch (this.state) {
        case STATES.IDLE:
          this.updateIdle(delta);
          break;
        case STATES.ALERTED:
          this.updateAlerted(delta);
          break;
        case STATES.PATROLLING:
          this.updatePatrolling(delta);
          break;
        case STATES.CHASING:
          this.updateChasing(delta);
          break;
        case STATES.AIMING:
          this.updateAiming(delta);
          break;
        case STATES.ATTACKING:
          this.updateAttacking(delta);
          break;
        case STATES.HURTING:
          this.updateHurting(delta);
          break;
        default:
          break;
      }

      super.update(delta);
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
  updateAlerted(delta) {
    if (this.findPlayer()) {
      this.alertTimer += TIME_STEP * delta;

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
  updateAiming(delta) {
    if (this.findPlayer()) {
      if (this.distanceToPlayer <= this.attackRange) {
        this.aimTimer += TIME_STEP * delta;

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
  updateAttacking(delta) {
    if (this.findPlayer()) {
      if (this.distanceToPlayer <= this.attackRange) {
        this.attackTimer += TIME_STEP * delta;

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
  updateHurting(delta) {
    this.hurtTimer += TIME_STEP * delta;

    if (this.hurtTimer >= this.hurtTime) {
      this.onHurtComplete();
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

    return player.isAlive() && distance > this.distanceToPlayer;
  }

  /**
   * Hurt the enemy
   * @param  {Number} amount The amount of hit points.
   */
  hurt(amount) {
    this.health -= amount;

    if (this.health > 0) {
      this.setHurting();
    } else {
      this.setDead();
    }
  }

  /**
   * Get the type of blood spatter.
   * @return {Number} The type of blood spatter.
   */
  spatter() {
    return Math.floor(Math.random() * this.spatters) + 1;
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
      this.emitSound(this.sounds.alert, {
        distance: this.distanceToPlayer,
      });
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
      this.waypoint = this.parent.getCell(this.gridX, this.gridY);
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

      this.emitSound(this.sounds.pain, {
        distance: this.distanceToPlayer,
      });
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
      this.velocity = 0;
      this.blocking = false;

      this.emitSound(this.sounds.death, {
        distance: this.distanceToPlayer,
      });

      this.parent.stop(this);
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
