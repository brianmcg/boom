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
  constructor({ explosionType, maxAttacks, ...other }) {
    super({ explosionType, maxAttacks, ...other });

    this.hitScans = [...Array(maxAttacks).keys()].map(() => new HitScan({
      explosionType: this.explosionType,
    }));
  }

  /**
   * Use the weapon.
   */
  use() {
    if (this.isUseable() && this.setUsing()) {
      const {
        power,
        accuracy,
        pellets,
        spreadAngle,
        pelletAngle,
        range,
        hitScans,
        player,
      } = this;

      let rayAngle = (player.angle - spreadAngle + DEG_360) % DEG_360;

      for (let i = 0; i < pellets.length; i += 1) {
        const hitScan = hitScans.shift();

        if (hitScan) {
          hitScan.execute({
            ray: player.castRay(rayAngle),
            damage: power * (Math.floor(Math.random() * accuracy) + 1),
            parent: player.parent,
            range,
            power,
          });

          hitScans.push(hitScan);

          rayAngle = (rayAngle + pelletAngle) % DEG_360;
        }
      }

      super.use();
    }
  }
}

export default HitScanWeapon;
