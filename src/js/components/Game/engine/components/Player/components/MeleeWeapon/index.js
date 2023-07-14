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
  constructor({ recoil, ...options }) {
    super({ recoil, ...options });
    // this.hitRecoil = recoil;
    // this.recoil = 0;
  }

  use() {
    if (this.isUseable() && this.setUsing()) {
      const { pellets, spreadAngle, pelletAngle, projectiles, player } = this;

      const collisions = [];

      const projectileAngle = (player.angle - player.moveAngle + DEG_360) % DEG_360;

      let rayAngle = (projectileAngle - spreadAngle + DEG_360) % DEG_360;

      for (let i = 0; i < pellets.length; i++) {
        const projectile = projectiles.shift();
        const emitLight = !this.isMelee() && (i === 0 || i === pellets.length - 1);

        if (projectile) {
          projectile.run(rayAngle, emitLight).forEach(collision => {
            collisions.push(collision);
          });
          projectiles.push(projectile);
          rayAngle = (rayAngle + pelletAngle) % DEG_360;
        }
      }

      if (this.isMelee()) {
        const recoil = !collisions.length ? 0 : this.recoil;
        const sound = this.secondary && !collisions.length ? null : this.sounds.use;
        this.emit(EVENTS.USE, { recoil, sound });
      } else {
        super.use();
      }
    }
  }
}

export default MeleeWeapon;
