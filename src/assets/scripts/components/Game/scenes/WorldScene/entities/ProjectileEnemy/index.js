import AbstractEnemy from '../AbstractEnemy';
import Projectile from '../Projectile';

const PROJECTILE_RESERVE = 3;

/**
 * Abstract class representing a gun enemy.
 * @extends {AbstractEnemy}
 */
class ProjectileEnemy extends AbstractEnemy {
  constructor({
    maxAttacks,
    projectile,
    clipSize,
    soundSprite,
    ...other
  }) {
    super({ soundSprite, maxAttacks, ...other });

    this.projectiles = [...Array(maxAttacks * PROJECTILE_RESERVE).keys()]
      .map(() => new Projectile({
        ...projectile,
        source: this,
        soundSprite,
      }));
  }

  /**
   * Execute completed attack behavior.
   */
  onAttackComplete() {
    this.setAiming();
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
    if (this.projectiles.length) {
      this.parent.add(this.projectiles.shift());
    }
  }
}

export default ProjectileEnemy;
