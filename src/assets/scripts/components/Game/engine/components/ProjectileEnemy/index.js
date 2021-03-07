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

    this.projectiles = [];

    [...Array(amount).keys()].forEach(() => {
      this.projectiles.push(new Projectile({
        ...projectileProps,
        source: this,
        soundSprite,
        queue: this.projectiles,
      }));
    });
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
      projectile.set({ angle: this.angle, damage: this.attackDamage() });
      this.parent.add(projectile);
    }
  }
}

export default ProjectileEnemy;
