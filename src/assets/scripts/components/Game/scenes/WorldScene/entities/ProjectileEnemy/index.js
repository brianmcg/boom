import AbstractEnemy from '../AbstractEnemy';
import Projectile from '../Projectile';

/**
 * Abstract class representing a projectile enemy.
 * @extends {AbstractEnemy}
 */
class ProjectileEnemy extends AbstractEnemy {
  /**
   * Creates a projectile enemy.
   * @param  {Object}    options.primaryAttack
   * @param  {Object}    options.soundSprite
   */
  constructor({ primaryAttack = {}, soundSprite = {}, ...other }) {
    super({ soundSprite, primaryAttack, ...other });

    const { amount, ...projectileProps } = primaryAttack.projectile;

    this.projectiles = [...Array(amount).keys()].map(() => new Projectile({
      ...projectileProps,
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
