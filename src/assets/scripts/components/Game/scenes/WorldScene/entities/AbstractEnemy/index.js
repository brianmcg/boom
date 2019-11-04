import AbstractActor from '../AbstractActor';
import { DEG } from '~/core/physics';

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
    this.velocity = 1;
    this.rotVelocity = DEG[1];

    if (this.constructor === AbstractEnemy) {
      throw new TypeError('Can not construct abstract class.');
    }
  }

  update(delta) {
    switch (this.state) {
      case STATES.DEAD:
        this.velocity = 0;
        break;
      default:
        this.velocity = 1;
        break;
    }

    super.update(delta);
  }

  /**
   * Set the enemy to the idle state.
   */
  setIdle() {
    this.setState(STATES.IDLE);
  }

  /**
   * Set the enemy to the patrolling state.
   */
  setPatrolling() {
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
