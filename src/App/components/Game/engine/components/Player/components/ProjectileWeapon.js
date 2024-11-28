import { degrees } from '@game/core/physics';
import AbstractWeapon from './AbstractWeapon';
import Projectile from '../../Projectile';

const DEG_360 = degrees(360);

export default class ProjectileWeapon extends AbstractWeapon {
  constructor({ soundSprite, ...other }) {
    super(other);

    const { amount, ...otherOptions } = this.projectile;

    this.projectiles = [];

    [...Array(amount).keys()].forEach(() => {
      this.projectiles.push(
        new Projectile({
          ...otherOptions,
          source: this.player,
          soundSprite,
          queue: this.projectiles,
        })
      );
    });
  }

  use() {
    const result = super.use();

    if (result.success) {
      const { angle, moveAngle, parent } = this.player;
      const damage =
        this.power * (Math.floor(Math.random() * this.accuracy) + 1);
      const projectile = this.projectiles.shift();

      projectile.set({
        angle: (angle - moveAngle + DEG_360) % DEG_360,
        damage,
      });

      parent.add(projectile);

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
    return super.canUse() && this.ammo > 0 && !!this.projectiles.length;
  }
}
