import AbstractEnemy from '../AbstractEnemy';
import Projectile from '../Projectile';

/**
 * Abstract class representing a gun enemy.
 * @extends {AbstractEnemy}
 */
class ProjectileEnemy extends AbstractEnemy {
  constructor({
    projectiles,
    projectile,
    clipSize,
    ...other
  }) {
    super(other);

    this.projectiles = [...Array(projectiles).keys()]
      .map(() => new Projectile({
        ...projectile,
        source: this,
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
      const projectile = this.projectiles.shift();
      const distance = Math.sqrt((this.width * this.width) * 2) + 1;
      const x = this.x + Math.cos(this.angle) * distance;
      const y = this.y + Math.sin(this.angle) * distance;

      projectile.setProperties({
        x,
        y,
        z: this.z,
        angle: this.angle,
      });

      this.parent.add(projectile);
    }
  }
}

export default ProjectileEnemy;
