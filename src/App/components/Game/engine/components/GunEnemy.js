import { CELL_SIZE } from '@constants/config';
import { degrees } from '@game/core/physics';
import AbstractEnemy from './AbstractEnemy';
import HitScan from './HitScan';

const DEG_360 = degrees(360);

export default class GunEnemy extends AbstractEnemy {
  constructor({ primaryAttack, ...other }) {
    super({ primaryAttack, ...other });

    const { pellets, spread } = primaryAttack;

    this.primaryAttack = {
      ...this.primaryAttack,
      pellets: [...Array(pellets).keys()].map(i => i),
      spreadAngle:
        pellets > 1 ? Math.atan2(CELL_SIZE, CELL_SIZE * spread) / 2 : 0,
      pelletAngle:
        pellets > 1 ? Math.atan2(CELL_SIZE, CELL_SIZE * spread) / pellets : 0,
    };

    this.graphIndex = 1;

    this.projectiles = [...Array(pellets).keys()].map(
      () =>
        new HitScan({
          source: this,
          power: this.primaryAttack.power,
          accuracy: this.primaryAttack.accuracy,
        })
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

    const { spreadAngle, pelletAngle, pellets } = this.primaryAttack;

    let rayAngle = (this.angle - spreadAngle + DEG_360) % DEG_360;

    for (let i = 0; i < pellets.length; i++) {
      const projectile = this.projectiles.shift();

      if (projectile) {
        projectile.run(rayAngle);
        this.projectiles.push(projectile);
      }

      rayAngle = (rayAngle + pelletAngle) % DEG_360;
    }

    this.emitSound(this.sounds.attack);
  }
}
