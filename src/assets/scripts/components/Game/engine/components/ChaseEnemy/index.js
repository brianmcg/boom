import { degrees } from 'game/core/physics';
import AbstractEnemy from '../AbstractEnemy';

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

/**
 * Abstract class representing a gun enemy.
 * @extends {AbstractEnemy}
 */
class ChaseEnemy extends AbstractEnemy {
  /**
   * Execute completed attack behavior.
   */
  onAttackComplete() {
    this.setChasing();
  }

  /**
   * Execute recovery behaviour.
   */
  onHurtComplete() {
    this.target = this.parent.player;
    this.setChasing();
  }

  /**
   * Attack a target.
   */
  attack() {
    const { player } = this.parent;

    this.emitSound(this.sounds.attack);

    const angle = (this.getAngleTo(player) - DEG_180 + DEG_360) % DEG_360;
    const damage = this.attackDamage();

    player.hit({ damage, angle });
  }

  /**
   * Set the enemy to the attacking state.
   * @return {Boolean}  State change successful.
   */
  setAttacking() {
    super.setAttacking();
    this.velocity = this.speed;
  }
}

export default ChaseEnemy;
