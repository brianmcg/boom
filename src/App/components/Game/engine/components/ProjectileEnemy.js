import { degrees } from '@game/core/physics';
import AbstractEnemy from './AbstractEnemy';
import Projectile from './Projectile';

export default class ProjectileEnemy extends AbstractEnemy {
  constructor({ primaryAttack = {}, soundSprite = {}, ...other }) {
    super({ soundSprite, primaryAttack, ...other });

    const { pellets, projectile, pelletAngle = 30 } = primaryAttack;
    const { amount, ...projectileProps } = projectile;

    this.projectiles = [];

    [...Array(amount).keys()].forEach(() => {
      this.projectiles.push(
        new Projectile({
          ...projectileProps,
          source: this,
          soundSprite,
          queue: this.projectiles,
        })
      );
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

    if (this.projectiles.length) {
      this.offsets.forEach(offset => {
        const projectile = this.projectiles.shift();

        projectile.set({
          offset,
          angle: this.angle,
          damage: this.attackDamage(),
        });

        this.parent.add(projectile);
      });
    }
  }
}
