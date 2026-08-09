import { degrees } from '@game/core/physics';
import AbstractEnemy from './AbstractEnemy';
import Projectile from '../damage/Projectile';

export default class ProjectileEnemy extends AbstractEnemy {
  constructor({ primaryAttack = {}, soundSprite = {}, ...other }) {
    super({ soundSprite, primaryAttack, ...other });

    const { pellets, projectile, pelletAngle = 30 } = primaryAttack;
    const { amount, ...projectileProps } = projectile;

    // `projectiles` is the full, immutable set (used for teardown and sprite
    // creation); `pool` is the mutable set of available projectiles. In-flight
    // projectiles leave the pool but remain in `projectiles`.
    this.pool = [];
    this.projectiles = [];

    [...Array(amount).keys()].forEach(() => {
      const projectile = new Projectile({
        ...projectileProps,
        source: this,
        soundSprite,
        queue: this.pool,
      });

      this.pool.push(projectile);
      this.projectiles.push(projectile);
    });

    this.graphIndex = 1;

    this.offsets =
      pellets % 2 === 0
        ? [...new Array(pellets + 1).keys()]
            .map(
              i =>
                ((i - Math.round(pellets / 2)) * degrees(pelletAngle)) / pellets
            )
            .filter(i => i)
        : [...new Array(pellets).keys()].map(
            i =>
              ((i - Math.floor(pellets / 2)) * degrees(pelletAngle)) / pellets
          );
  }

  onAttackComplete() {
    this.setAiming();
  }

  onHurtComplete() {
    this.setEvading();
  }

  attack() {
    super.attack();

    this.emitSound(this.sounds.attack);

    if (this.pool.length) {
      this.offsets.forEach(offset => {
        const projectile = this.pool.shift();

        projectile.set({
          offset,
          angle: this.angle,
          damage: this.attackDamage(),
        });

        this.parent.add(projectile);
      });
    }
  }

  destroy() {
    super.destroy();
    this.projectiles.forEach(projectile => projectile.destroy());
  }
}
