import AbstractWeapon from './AbstractWeapon';
import Projectile from '../../../damage/Projectile';

export default class ProjectileWeapon extends AbstractWeapon {
  constructor({ soundSprite, ...other }) {
    super(other);

    const { amount, ...otherOptions } = this.projectile;

    // `projectiles` is the full, immutable set (used for teardown and sprite
    // creation); `pool` is the mutable set of available projectiles. In-flight
    // projectiles leave the pool but remain in `projectiles`.
    this.pool = [];
    this.projectiles = [];

    [...Array(amount).keys()].forEach(() => {
      const projectile = new Projectile({
        ...otherOptions,
        source: this.player,
        soundSprite,
        queue: this.pool,
      });

      this.pool.push(projectile);
      this.projectiles.push(projectile);
    });
  }

  use() {
    const result = super.use();

    if (result.success) {
      const { heading, parent } = this.player;
      const damage =
        this.power * (Math.floor(Math.random() * this.accuracy) + 1);
      const projectile = this.pool.shift();

      projectile.set({
        // Fire where the player is facing, not where they are sliding.
        angle: heading,
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
    return super.canUse() && this.ammo > 0 && !!this.pool.length;
  }
}
