import { CELL_SIZE } from 'game/constants/config';
import { atan2 } from 'game/core/physics';
import AbstractActor from '../AbstractActor';

const STATES = {
  IDLE: 'enemy:idle',
  ALERTED: 'enemy:alerted',
  CHASING: 'enemy:chasing',
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
   * @param  {Number} options.alerTime        The time before attacking adter alert.
   * @param  {Number} options.acceleration    The acceleration of the enemy.
   */
  constructor({
    maxVelocity = 1,
    attackRange = 250,
    attackTime = 1000,
    hurtTime = 1000,
    alertTime = 1000,
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

    this.type = type;
    this.spatters = spatters;
    this.attackRange = attackRange * CELL_SIZE;
    this.attackTime = attackTime;
    this.hurtTime = hurtTime;
    this.alertTime = alertTime;
    this.maxVelocity = maxVelocity;
    this.acceleration = acceleration;
    this.attackPower = attackPower;
    this.distanceToPlayer = Number.MAX_VALUE;
    this.attackTimer = 0;
    this.hurtTimer = 0;
    this.alertTimer = 0;

    this.setIdle();
  }

  /**
   * Update the enemy.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    switch (this.state) {
      case STATES.IDLE:
        this.updateIdle(delta);
        break;
      case STATES.ALERTED:
        this.updateAlerted(delta);
        break;
      case STATES.CHASING:
        this.updateChasing(delta);
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

  /**
   * Update enemy in idle state
   */
  updateIdle() {
    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement this method.');
    }
  }

  /**
   * Update enemy in the alerted state.
   * @param  {Number} delta The delta time.
   */
  updateAlerted() {
    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement this method.');
    }
  }

  /**
   * Update enemy in chasing state
   */
  updateChasing() {
    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement this method.');
    }
  }

  /**
   * Update enemy in attacking state
   * @param  {Number} delta The delta time.
   */
  updateAttacking() {
    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement this method.');
    }
  }

  /**
   * Update enemy in hurt state
   * @param  {Number} delta The delta time.
   */
  updateHurting() {
    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement this method.');
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
   * Try and locate the player
   * @return {Boolean} Was the player located.
   */
  findPlayer() {
    const { distance } = this.castRay();
    const { player } = this.world;

    return player.isAlive() && distance > this.distanceToPlayer;
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
   * Add a callback to the alerted state change.
   * @param  {Function} callback The callback function.
   */
  onAlerted(callback) {
    this.on(STATES.ALERTED, callback);
  }

  /**
   * Add a callback to the idle moving change.
   * @param  {Function} callback The callback function.
   */
  onChasing(callback) {
    this.on(STATES.CHASING, callback);
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
    const stateChange = this.setState(STATES.IDLE);

    if (stateChange) {
      this.velocity = 0;
    }

    return stateChange;
  }

  /**
   * Set the enemy to the alerted state.
   * @return {Boolean}  State change successful.
   */
  setAlerted() {
    const stateChanged = this.setState(STATES.ALERTED);

    if (stateChanged) {
      this.emitSound(this.sounds.alert, {
        distance: this.distanceToPlayer,
      });
    }
  }

  /**
   * Set the enemy to the moving state.
   * @return {Boolean}  State change successful.
   */
  setChasing() {
    this.velocity = Math.min(
      this.maxVelocity,
      this.maxVelocity + this.acceleration,
    );

    return this.setState(STATES.CHASING);
  }

  /**
   * Set the enemy to the attacking state.
   * @return {Boolean}  State change successful.
   */
  setAttacking() {
    const stateChange = this.setState(STATES.ATTACKING);

    if (stateChange) {
      this.attack();
      this.velocity = 0;
    }

    return stateChange;
  }

  /**
   * Set the enemy to the hurting state.
   * @return {Boolean}  State change successful.
   */
  setHurting() {
    const stateChange = this.setState(STATES.HURTING);

    if (stateChange) {
      this.velocity = 0;

      this.emitSound(this.sounds.pain, {
        distance: this.distanceToPlayer,
      });
    }

    return stateChange;
  }

  /**
   * Set the enemy to the dead state.
   * @return {Boolean}  State change successful.
   */
  setDead() {
    const stateChange = this.setState(STATES.DEAD);

    if (stateChange) {
      this.velocity = 0;
      this.blocking = false;

      this.emitSound(this.sounds.death, {
        distance: this.distanceToPlayer,
      });

      this.world.stop(this);
    }

    return stateChange;
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
   * Is the enemy in the chasing state.
   * @return {Boolean}
   */
  isChasing() {
    return this.state === STATES.CHASING;
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
    const stateChange = super.setState(state);

    if (stateChange) {
      this.attackTimer = 0;
      this.hurtTimer = 0;
      this.alertTimer = 0;
      this.emit(state);
    }

    return stateChange;
  }
}

export default AbstractEnemy;
