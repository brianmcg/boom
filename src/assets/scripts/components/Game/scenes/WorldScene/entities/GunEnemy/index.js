import AbstractEnemy from '../AbstractEnemy';

/**
 * Abstract class representing a gun enemy.
 * @extends {AbstractEnemy}
 */
class GunEnemy extends AbstractEnemy {
  /**
   * Execute completed attack behavior.
   */
  onAttackComplete() {
    this.setIdle();
    this.setAttacking();
  }

  /**
   * Execute recovery behaviour.
   */
  onHurtComplete() {
    this.setPatrolling();
  }

  /**
   * Attack a target.
   */
  attack() {
    const { player } = this.world;
    const ray = this.castRay();

    this.emitSound(this.sounds.attack, {
      distance: this.distanceToPlayer,
    });

    if (player.rayCollision(ray)) {
      player.hurt(this.attackPower);
    }
  }
}

export default GunEnemy;
