import { degrees } from '@game/core/physics';
import AbstractWeapon from '../AbstractWeapon';
import Projectile from '../../../Projectile';

const DEG_360 = degrees(360);

/**
 * Class representing a projectile weapon.
 */
class ProjectileWeapon extends AbstractWeapon {
  /**
   * Creates a projectile weapon.
   * @param  {Player}  options.player     The player.
   * @param  {Number}  options.power      The power of the weapon.
   * @param  {Boolean} options.equiped    Is the weapon equiped.
   * @param  {Number}  options.recoil     The recoil of the weapon.
   * @param  {Number}  options.maxAmmo    The max amount of ammo the weapon can hold.
   * @param  {Number}  options.range      The range of the weapon.
   * @param  {Number}  options.accuracy   The accuracy of the weapon.
   * @param  {Number}  options.pellets    The number of pellets per use.
   * @param  {Number}  options.spread     The spread of the pellets.
   * @param  {Object}  options.sounds     The weapon sounds.
   * @param  {String}  options.name       The weapon name.
   * @param  {Number}  options.ammo       The ammo of the weapon.
   * @param  {Number}  options.rate       The rate of fire.
   * @param  {Number}  options.automatic  Automatic weapon option.
   * @param  {Number}  options.type       The type of weapon.
   * @param  {Object}  options.projectile The weapon projectile data.
   * @param  {Boolean} options.secondary  The weapon is secondary.
   */
  constructor({ soundSprite, ...other }) {
    super({ soundSprite, ...other });

    const { amount, ...otherOptions } = this.projectile;

    this.projectiles = [];

    [...Array(amount).keys()].forEach(() => {
      this.projectiles.push(
        new Projectile({
          ...otherOptions,
          source: this.player,
          soundSprite,
          queue: this.projectiles,
        }),
      );
    });
  }

  /**
   * Use the weapon.
   */
  use() {
    const result = super.use();

    if (result.success) {
      const { angle, moveAngle, parent } = this.player;
      const damage = this.power * (Math.floor(Math.random() * this.accuracy) + 1);
      const projectile = this.projectiles.shift();

      projectile.set({
        angle: (angle - moveAngle + DEG_360) % DEG_360,
        damage,
      });

      parent.add(projectile);

      if (this.ammo > 0) {
        this.ammo -= 1;
      }

      return { ...result, recoil: this.recoil, sound: this.sounds.use, flash: this.flash };
    }

    return result;
  }

  canUse() {
    return super.canUse() && this.ammo > 0 && !!this.projectiles.length;
  }
}

export default ProjectileWeapon;
