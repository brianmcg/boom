import { degrees } from '@game/core/physics';
import AbstractWeapon from './AbstractWeapon';
import HitScan from '../../HitScan';

const DEG_360 = degrees(360);

export default class HitScanWeapon extends AbstractWeapon {
  constructor({ penetration, ...other }) {
    super(other);

    const { amount, effects, instantKill } = this.projectile;

    this.penetration = penetration;

    this.projectiles = [...Array(amount).keys()].map(
      () =>
        new HitScan({
          effect: effects?.impact,
          source: this.player,
          power: this.power,
          range: this.range,
          accuracy: this.accuracy,
          penetration,
          instantKill,
        })
    );
  }

  use() {
    const result = super.use();

    if (result.success) {
      const { pellets, spreadAngle, pelletAngle, projectiles, player } = this;

      const collisions = [];

      const projectileAngle =
        (player.angle - player.moveAngle + DEG_360) % DEG_360;

      let rayAngle = (projectileAngle - spreadAngle + DEG_360) % DEG_360;

      for (let i = 0; i < pellets.length; i++) {
        const projectile = projectiles.shift();

        if (projectile) {
          projectile.run(rayAngle).forEach(collision => {
            collisions.push(collision);
          });
          projectiles.push(projectile);
          rayAngle = (rayAngle + pelletAngle) % DEG_360;
        }
      }

      return { ...result, hasCollisions: collisions.length > 0 };
    }

    return result;
  }

  get props() {
    return { ...super.props, penetration: this.penetration };
  }
}
