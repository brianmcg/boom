import { UPDATE_DISTANCE, TIME_STEP } from 'game/constants/config';
import { atan2 } from 'game/core/physics';
import AbstractActor from '../AbstractActor';

const STATES = {
  IDLE: 'enemy:idle',
  MOVING: 'enemy:moving',
  AIMING: 'enemy:aiming',
  ATTACKING: 'enemy:attacking',
  HURTING: 'enemy:hurting',
  DEAD: 'enemy:dead',
};

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
   * @param  {Number} options.length          The length of the character.
   * @param  {Number} options.height          The height of the character.
   * @param  {Number} options.angle           The angle of the character.
   * @param  {Number} options.maxHealth       The maximum health of the character.
   * @param  {Number} options.maxVelocity     The maximum velocity of the enemy.
   * @param  {Number} options.attackRange     The attack range of the enemy.
   * @param  {Number} options.attackTime      The time between attacks.
   * @param  {Number} options.hurtTime        The time the enemy remains hurt when hit.
   * @param  {Number} options.acceleration    The acceleration of the enemy.
   */
  constructor({
    maxVelocity = 1,
    attackRange = 250,
    attackTime = 1000,
    hurtTime = 1000,
    acceleration = 1,
    attackPower = 1,
    type,
    spatters,
    ...other
  }) {
    super(other);

    if (this.constructor === AbstractEnemy) {
      throw new TypeError('Can not construct abstract class.');
    }

    this.spatters = spatters;
    this.attackRange = attackRange;
    this.attackTime = attackTime;
    this.hurtTime = hurtTime;
    this.maxVelocity = maxVelocity;
    this.acceleration = acceleration;

    this.distanceToPlayer = Number.MAX_VALUE;
    this.attackTimer = 0;
    this.hurtTimer = 0;
    this.attackPower = attackPower;

    this.setIdle();
  }

  /**
   * Update the enemy.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    if (this.isDead()) return;

    const { player } = this.world;

    this.distanceToPlayer = this.distanceTo(player);

    if (this.distanceToPlayer < UPDATE_DISTANCE) {
      this.face(player);

      switch (this.state) {
        case STATES.IDLE:
          this.updateIdle(delta);
          break;
        case STATES.MOVING:
          this.updateMoving(delta);
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
      if (this.distanceToPlayer <= this.attackRange) {
        this.setAiming();
      } else {
        this.setMoving();
      }
    }
  }

  /**
   * Update enemy in chasing state
   */
  updateMoving() {
    if (this.findPlayer()) {
      if (this.distanceToPlayer <= this.attackRange) {
        this.setAiming();
      }
    } else {
      this.setIdle();
    }
  }

  /**
   * Update enemy in aiming state
   * @param  {Number} delta The delta time.
   */
  updateAiming(delta) {
    this.attackTimer += TIME_STEP * delta;

    if (this.attackTimer >= this.attackTime) {
      this.attackTimer = 0;
      this.setAttacking();
    }
  }

  /**
   * Update enemy in attacking state
   * @param  {Number} delta The delta time.
   */
  updateAttacking(delta) {
    this.attackTimer += TIME_STEP * delta;

    if (this.attackTimer >= this.attackTime) {
      this.attackTimer = 0;

      if (this.findPlayer()) {
        if (this.distanceToPlayer <= this.attackRange) {
          this.setAiming();
          this.setAttacking();
        } else {
          this.setMoving();
        }
      } else {
        this.setIdle();
      }
    }
  }

  /**
   * Update enemy in hurt state
   * @param  {Number} delta The delta time.
   */
  updateHurting(delta) {
    this.hurtTimer += TIME_STEP * delta;

    if (this.hurtTimer >= this.hurtTime) {
      this.hurtTimer = 0;
      this.setIdle();
    }
  }

  /**
   * Try and locate the player
   * @return {Boolean} Was the player located.
   */
  findPlayer() {
    const { distance } = this.castRay();
    const { player } = this.world;

    return player.isAlive() && distance > this.distanceToPlayer;
  }

  /**
   * Attack a target.
   */
  attack() {
    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement the method attack.');
    }
  }

  /**
   * Set the enemy angle to face a body.
   * @param  {Body} body The body to face.
   */
  face(body) {
    const dx = body.x - this.x;
    const dy = body.y - this.y;

    this.angle = atan2(dy, dx);
  }

  /**
   * Hit the enemy
   * @param  {Number} amount The amount of hit points.
   */
  hit(amount) {
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
   * Add a callback to the idle moving change.
   * @param  {Function} callback The callback function.
   */
  onMoving(callback) {
    this.on(STATES.MOVING, callback);
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
   */
  setIdle() {
    this.velocity = 0;
    this.setState(STATES.IDLE);
  }

  /**
   * Set the enemy to the moving state.
   */
  setMoving() {
    this.velocity = Math.min(
      this.maxVelocity,
      this.maxVelocity + this.acceleration,
    );

    this.setState(STATES.MOVING);
  }

  /**
   * Set the enemy to the aiming state.
   */
  setAiming() {
    this.velocity = 0;
    this.setState(STATES.AIMING);
  }

  /**
   * Set the enemy to the attacking state.
   */
  setAttacking() {
    this.setState(STATES.ATTACKING);
    this.attack();
  }

  /**
   * Set the enemy to the hurting state.
   */
  setHurting() {
    this.velocity = 0;
    this.setState(STATES.HURTING);
  }

  /**
   * Set the enemy to the dead state.
   */
  setDead() {
    this.velocity = 0;
    this.blocking = false;
    this.setState(STATES.DEAD);
  }

  /**
   * Is the enemy in the idle state.
   * @return {Boolean}
   */
  isIdle() {
    return this.state === STATES.IDLE;
  }

  /**
   * Is the enemy in the chasing state.
   * @return {Boolean}
   */
  isMoving() {
    return this.state === STATES.MOVING;
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
   * Set the state.
   * @param {String} state The new state.
   */
  setState(state) {
    if (super.setState(state)) {
      this.emit(state);
    }
  }
}

export default AbstractEnemy;
