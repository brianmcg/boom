import { UPDATE_DISTANCE, TIME_STEP } from 'game/constants/config';
import { distanceBetween, atan2, castRay } from 'game/core/physics';
import AbstractActor from '../AbstractActor';

const STATES = {
  IDLE: 'enemy:idle',
  CHASING: 'enemy:chase',
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
  constructor({
    attackDistance = 250,
    attackTime = 1000,
    hurtTime = 1000,
    ...other
  }) {
    super(other);

    if (this.constructor === AbstractEnemy) {
      throw new TypeError('Can not construct abstract class.');
    }

    this.attackDistance = attackDistance;
    this.attackTime = attackTime;
    this.hurtTime = hurtTime;

    this.distanceToPlayer = Number.MAX_VALUE;
    this.attackTimer = 0;
    this.hurtTimer = 0;

    this.setIdle();
  }

  /**
   * Update the enemy.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    if (this.isDead()) return;

    const { player } = this.world;

    this.distanceToPlayer = distanceBetween(this, player);

    if (this.distanceToPlayer < UPDATE_DISTANCE) {
      this.turnToFace(player);

      switch (this.state) {
        case STATES.IDLE:
          this.updateIdle(delta);
          break;
        case STATES.CHASING:
          this.updateChasing(delta);
          break;
        case STATES.ATTACKING:
          this.updateAttacking(delta);
          break;
        case STATES.HURT:
          this.updateHurt(delta);
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
  updateIdle() {
    const { distance } = castRay({ caster: this });

    if (distance > this.distanceToPlayer) {
      if (this.distanceToPlayer <= this.attackDistance) {
        this.setAttacking();
      } else {
        this.setChasing();
      }
    }
  }

  /**
   * Update enemy in chasing state
   * @param  {Number} delta The delta time.
   */
  updateChasing() {
    if (this.distanceToPlayer < this.attackDistance) {
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
      this.setIdle();
    }
  }

  /**
   * Update enemy in hurt state
   * @param  {Number} delta The delta time.
   */
  updateHurt(delta) {
    this.hurtTimer += TIME_STEP * delta;

    if (this.hurtTimer >= this.hurtTime) {
      this.hurtTimer = 0;
      this.setIdle();
    }
  }

  /**
   * Set the enemy angle to face a body.
   * @param  {Body} body The body to face.
   */
  turnToFace(body) {
    const dx = body.x - this.x;
    const dy = body.y - this.y;

    this.angle = atan2(dy, dx);
  }

  hurt(amount) {
    this.health -= amount;

    if (this.health > 0) {
      this.setHurt();
    } else {
      this.setDead();
    }
  }

  /**
   * Set the enemy to the idle state.
   */
  setIdle() {
    this.velocity = 0;
    this.setState(STATES.IDLE);
  }

  /**
   * Set the enemy to the idle state.
   */
  setChasing() {
    this.setState(STATES.CHASING);
    this.velocity = 1;
  }

  /**
   * Set the enemy to the attacking state.
   */
  setAttacking() {
    this.velocity = 0;
    this.setState(STATES.ATTACKING);
  }

  /**
   * Set the enemy to the hurt state.
   */
  setHurt() {
    this.velocity = 0;
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
