import { TIME_STEP, UPDATE_DISTANCE } from 'game/constants/config';
import AbstractEnemy from '../AbstractEnemy';

/**
 * Abstract class representing a gun enemy.
 * @extends {AbstractEnemy}
 */
class ChaseEnemy extends AbstractEnemy {
  /**
   * Update the enemy.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    const { player } = this.world;

    this.distanceToPlayer = this.distanceTo(player);

    if (this.distanceToPlayer < UPDATE_DISTANCE) {
      this.face(player);

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
          this.setAttacking();
        } else {
          this.setMoving();
        }
      }
    }
  }

  /**
   * Update enemy in chasing state
   */
  updateMoving() {
    if (this.findPlayer()) {
      if (this.distanceToPlayer <= this.attackRange) {
        this.setAttacking();
      }
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
          this.setIdle();
          this.setAttacking();
        }
      } else {
        this.setMoving();
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
      this.setMoving();
    }
  }

  /**
   * Attack a target.
   */
  attack() {
    const { player } = this.world;

    this.emitSound(this.sounds.attack, {
      distance: this.distanceToPlayer,
    });

    player.hurt(this.attackPower);
  }
}

export default ChaseEnemy;
