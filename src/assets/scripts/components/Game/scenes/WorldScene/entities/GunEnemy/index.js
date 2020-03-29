import { TIME_STEP, UPDATE_DISTANCE } from 'game/constants/config';
import AbstractEnemy from '../AbstractEnemy';

const STATES = {
  AIMING: 'enemy:aiming',
};

/**
 * Abstract class representing a gun enemy.
 * @extends {AbstractEnemy}
 */
class GunEnemy extends AbstractEnemy {
  /**
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
   * @param  {Number} options.aimTime         The time before attacking.
   * @param  {Number} options.clipSize        The amount of ammo in a clip.
   */
  constructor({ aimTime = 1000, clipSize = 1, ...other }) {
    super(other);

    this.aimTime = aimTime;
    this.clipSize = clipSize;
    this.ammo = clipSize;
    this.aimTimer = 0;
  }

  /**
   * Update the enemy.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    const { player } = this.world;

    this.distanceToPlayer = this.distanceTo(player);

    if (this.distanceToPlayer < UPDATE_DISTANCE) {
      this.face(player);

      switch (this.state) {
        case STATES.AIMING:
          this.updateAiming(delta);
          break;
        default:
          break;
      }

      super.update(delta);
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
          if (this.ammo === 0) {
            this.ammo = this.clipSize;
            this.setPatrolling();
          } else {
            this.setIdle();
            this.setAttacking();
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
      this.setPatrolling();
    }
  }

  /**
   * Attack a target.
   */
  attack() {
    const { player } = this.world;
    const ray = this.castRay();

    this.ammo -= 1;

    this.emitSound(this.sounds.attack, {
      distance: this.distanceToPlayer,
    });

    if (player.rayCollision(ray)) {
      player.hurt(this.attackPower);
    }
  }

  /**
   * Add a callback to the idle aiming change.
   * @param  {Function} callback The callback function.
   */
  onAiming(callback) {
    this.on(STATES.AIMING, callback);
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
   * Is the enemy in the aiming state.
   * @return {Boolean}
   */
  isAiming() {
    return this.state === STATES.AIMING;
  }

  /**
   * Set the state.
   * @param {String} state The new state.
   */
  setState(state) {
    const stateChange = super.setState(state);

    if (stateChange) {
      this.aimTimer = 0;
    }

    return stateChange;
  }
}

export default GunEnemy;
