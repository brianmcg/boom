import { degrees } from 'game/core/physics';
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

    const { pellets, projectile } = primaryAttack;
    const { amount, ...projectileProps } = projectile;

    this.projectiles = [];

    [...Array(amount).keys()].forEach(() => {
      this.projectiles.push(new Projectile({
        ...projectileProps,
        source: this,
        soundSprite,
        queue: this.projectiles,
      }));
    });

    this.graphIndex = 1;

    this.offsets = (pellets % 2 === 0)
      ? [...new Array(pellets + 1).keys()]
        .map(i => (i - Math.round(pellets / 2)) * degrees(30) / pellets)
        .filter(i => i)
      : [...new Array(pellets).keys()]
        .map(i => (i - Math.floor(pellets / 2)) * degrees(30) / pellets);
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
    this.setEvading();
  }

  /**
   * Attack a target.
   */
  attack() {
    this.emitSound(this.sounds.attack);

    if (this.projectiles.length) {
      this.offsets.forEach((offset) => {
        const projectile = this.projectiles.shift();

        projectile.set({
          offset,
          angle: this.angle,
          damage: this.attackDamage(),
        });

        this.parent.add(projectile);
      });
    }
  }
}

export default ProjectileEnemy;
