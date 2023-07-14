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
class MeleeWeapon extends HitScanWeapon {
  use() {
    if (this.isUseable() && this.setUsing()) {
      const hasCollisions = super.use();

      if (hasCollisions) {
        this.emitUse({ recoil: this.recoil, sound: this.sounds.use });
      } else {
        this.emitUse({ recoil: 0 });
      }
    }
  }
}

export default MeleeWeapon;
