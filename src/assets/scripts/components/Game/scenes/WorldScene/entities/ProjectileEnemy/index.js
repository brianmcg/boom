import { TIME_STEP, UPDATE_DISTANCE } from 'game/constants/config';
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
      const projectile = this.projectiles.pop();

      projectile.initialize();

      this.world.add(projectile);
    }
  }
}

export default ProjectileEnemy;
