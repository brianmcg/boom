import { degrees } from '@game/core/physics';
import HitScanWeapon from '../HitScanWeapon';
import { EVENTS } from '../AbstractWeapon';

const DEG_360 = degrees(360);

// const FOO = {
//   UNARMED: 'weapon:unarmed',
//   ARMING: 'weapon:arming',
//   AIMING: 'weapon:aiming',
//   LOADING: 'weapon:loading',
//   FIRING: 'weapon:firing',
//   UNARMING: 'weapon:unarming',
//   DISABLED: 'weapon:disabled',
// };

/**
 * Class representing a weapon.
 * @extends {EventEmitter}
 */
class BulletWeapon extends HitScanWeapon {
  use() {
    if (this.isUseable() && this.setUsing()) {
      // this.emitSound(this.sounds.use);

      super.use();
      this.emitUse({ recoil: this.recoil, sound: this.sounds.use });
    }
  }
}

export default BulletWeapon;
