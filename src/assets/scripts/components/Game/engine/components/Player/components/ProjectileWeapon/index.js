import { degrees } from 'game/core/physics';
import AbstractWeapon from '../AbstractWeapon';
import Projectile from '../../../Projectile';

const DEG_360 = degrees(360);

/**
 * Class representing a weapon.
 */
class ProjectileWeapon extends AbstractWeapon {
  /**
   * Creates a weapon.
   * @param  {Player}  options.player   The player.
   * @param  {Number}  options.power    The power of the weapon.
   * @param  {Boolean} options.equiped  Is the weapon equiped.
   * @param  {Number}  options.recoil   The recoil of the weapon.
   * @param  {Number}  options.maxAmmo  The max amount of ammo the weapon can hold.
   * @param  {Number}  options.range    The range of the weapon.
   * @param  {String}  options.texture  The weapon texture.
   */
  constructor({ projectile, soundSprite, ...other }) {
    super({ projectile, ...other });

    const { amount, ...otherOptions } = projectile;

    this.projectiles = [];

    [...Array(amount).keys()].forEach(() => {
      this.projectiles.push(new Projectile({
        ...otherOptions,
        source: this.player,
        soundSprite,
        queue: this.projectiles,
      }));
    });
  }

  /**
   * Use the weapon.
   */
  use() {
    if (this.projectiles.length && this.isUseable() && this.setUsing()) {
      const damage = this.power * (Math.floor(Math.random() * this.accuracy) + 1);
      const projectile = this.projectiles.shift();
      projectile.setDamage(damage);
      this.player.parent.add(projectile);
      super.use();
    }
  }
}

export default ProjectileWeapon;
