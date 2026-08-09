import HitScanWeapon from './HitScanWeapon';

export default class MeleeWeapon extends HitScanWeapon {
  use() {
    const result = super.use();

    if (result.success) {
      if (result.hasCollisions) {
        return { ...result, recoil: this.recoil, sound: this.sounds.use };
      }

      return result;
    }

    return result;
  }
}
