import AbstractEnemy from '../AbstractEnemy';

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
    this.setAiming();
  }

  /**
   * Attack a target.
   */
  attack() {
    const { player } = this.parent;

    this.emitSound(this.sounds.attack);

    player.hurt(this.attackDamage());
  }
}

export default ChaseEnemy;