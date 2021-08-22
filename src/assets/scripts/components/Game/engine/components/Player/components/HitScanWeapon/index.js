import { degrees } from 'game/core/physics';
import AbstractWeapon from '../AbstractWeapon';
import HitScan from '../../../HitScan';

const DEG_360 = degrees(360);

/**
 * Class representing a weapon.
 */
class HitScanWeapon extends AbstractWeapon {
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
  constructor({ projectile, highCalibre, ...other }) {
    super({ projectile, ...other });

    const { amount, effects } = projectile;

    this.highCalibre = highCalibre;

    this.projectiles = [...Array(amount).keys()].map(() => new HitScan({
      effect: effects?.impact,
      source: this.player,
      power: this.power,
      range: this.range,
      accuracy: this.accuracy,
      highCalibre,
    }));
  }

  /**
   * Use the weapon.
   */
  use() {
    if (this.isUseable() && this.setUsing()) {
      const {
        pellets,
        spreadAngle,
        pelletAngle,
        projectiles,
        player,
      } = this;

      const projectileAngle = (player.angle - player.moveAngle + DEG_360) % DEG_360;

      let rayAngle = (projectileAngle - spreadAngle + DEG_360) % DEG_360;

      for (let i = 0; i < pellets.length; i += 1) {
        const projectile = projectiles.shift();

        if (projectile) {
          projectile.run(rayAngle);
          projectiles.push(projectile);
          rayAngle = (rayAngle + pelletAngle) % DEG_360;
        }
      }

      super.use();
    }
  }
}

export default HitScanWeapon;
