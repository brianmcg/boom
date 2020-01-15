import { UPDATE_DISTANCE } from 'game/constants/config';
import { distanceBetween } from 'game/core/physics';
import AbstractActor from '../AbstractActor';

const STATES = {
  IDLE: 'enemy:idle',
  PATROLLING: 'enemy:patrol',
  CHASING: 'enemy:chase',
  READY: 'enemy:ready',
  AIMING: 'enemy:aim',
  ATTACKING: 'enemy:fire',
  HURT: 'enemy:hurt',
  DEAD: 'enemy:dead',
};

/**
 * Abstract class representing an enemy.
 * @extends {AbstractActor}
 */
class AbstractEnemy extends AbstractActor {
  /**
   * Creates an abstract enemy.
   * @param  {Number} options.x         The x coordinate of the character.
   * @param  {Number} options.y         The y coordinate of the character
   * @param  {Number} options.width     The width of the character.
   * @param  {Number} options.length    The length of the character.
   * @param  {Number} options.height    The height of the character.
   * @param  {Number} options.angle     The angle of the character.
   * @param  {Number} options.maxHealth The maximum health of the character.
   */
  constructor(options) {
    super(options);

    if (this.constructor === AbstractEnemy) {
      throw new TypeError('Can not construct abstract class.');
    }

    this.distanceToPlayer = Number.MAX_VALUE;

    this.setPatrolling();
  }

  /**
   * Update the enemy.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    if (this.isDead()) return;

    this.distanceToPlayer = distanceBetween(this, this.world.player);

    if (this.distanceToPlayer < UPDATE_DISTANCE) {
      switch (this.state) {
        case STATES.IDLE:
          this.updateIdle(delta);
          break;
        case STATES.PATROLLING:
          this.updatePatrolling(delta);
          break;
        case STATES.CHASING:
          this.updateChasing(delta);
          break;
        case STATES.READY:
          this.updateReady(delta);
          break;
        case STATES.AIMING:
          this.updateAiming(delta);
          break;
        case STATES.ATTACKING:
          this.updateAttacking(delta);
          break;
        case STATES.HURT:
          this.updateHurt(delta);
          break;
        case STATES.DEAD:
          break;
        default:
          break;
      }

      super.update(delta);
    }
  }

  /**
   * Update enemy in idle state
   * @param  {Number} delta The delta time.
   */
  updateIdle(delta) {
    this.placeholder = delta;
  }

  /**
   * Update enemy in patrolling state
   * @param  {Number} delta The delta time.
   */
  updatePatrolling(delta) {
    this.placeholder = delta;
  }

  /**
   * Update enemy in chasing state
   * @param  {Number} delta The delta time.
   */
  updateChasing(delta) {
    this.placeholder = delta;
  }

  /**
   * Update enemy in ready state
   * @param  {Number} delta The delta time.
   */
  updateReady(delta) {
    this.placeholder = delta;
  }

  /**
   * Update enemy in aiming state
   * @param  {Number} delta The delta time.
   */
  updateAiming(delta) {
    this.placeholder = delta;
  }

  /**
   * Update enemy in attacking state
   * @param  {Number} delta The delta time.
   */
  updateAttacking(delta) {
    this.placeholder = delta;
  }

  /**
   * Update enemy in hurt state
   * @param  {Number} delta The delta time.
   */
  updateHurt(delta) {
    this.placeholder = delta;
  }

  /**
   * Set the enemy to the idle state.
   */
  setIdle() {
    this.velocity = 0;
    this.setState(STATES.IDLE);
  }

  /**
   * Set the enemy to the patrolling state.
   */
  setPatrolling() {
    this.velocity = 1;
    this.setState(STATES.PATROLLING);
  }

  /**
   * Set the enemy to the chasing state.
   */
  setChasing() {
    this.setState(STATES.CHASING);
  }

  /**
   * Set the enemy to the ready state.
   */
  setReady() {
    this.setState(STATES.READY);
  }

  /**
   * Set the enemy to the aiming state.
   */
  setAiming() {
    this.setState(STATES.AIMING);
  }

  /**
   * Set the enemy to the attacking state.
   */
  setAttacking() {
    this.setState(STATES.ATTACKING);
  }

  /**
   * Set the enemy to the hurt state.
   */
  setHurt() {
    this.setState(STATES.HURT);
  }

  /**
   * Set the enemy to the dead state.
   */
  setDead() {
    this.blocking = false;
    this.velocity = 0;
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
   * Is the enemy in the patrolling state.
   * @return {Boolean}
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
   * Is the enemy in the ready state.
   * @return {Boolean}
   */
  isReady() {
    return this.state === STATES.READY;
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
  isHurt() {
    return this.state === STATES.HURT;
  }

  /**
   * Is the enemy in the dead state.
   * @return {Boolean}
   */
  isDead() {
    return this.state === STATES.DEAD;
  }
}

export default AbstractEnemy;
