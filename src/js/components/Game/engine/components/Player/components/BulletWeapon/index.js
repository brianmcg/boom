import HitScanWeapon from '../HitScanWeapon';

/**
 * Class representing a weapon.
 * @extends {EventEmitter}
 */
class BulletWeapon extends HitScanWeapon {
  use() {
    const result = super.use();

    if (result.success) {
      if (this.ammo > 0) {
        this.ammo -= 1;
      }

      return {
        ...result,
        recoil: this.recoil,
        sound: this.sounds.use,
        flash: this.flash,
      };
    }

    return result;
  }

  canUse() {
    return super.canUse() && this.ammo > 0;
  }
}

export default BulletWeapon;
