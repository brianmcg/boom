import { CELL_SIZE } from '@constants/config';
import { Body, degrees } from '@game/core/physics';
import HitScan from './HitScan';

const SPREAD = 24;

const INCREMENT = 360 / 24;

const ANGLES = [...Array(SPREAD).keys()].map(i => degrees(i * INCREMENT));

export default class Explosion extends Body {
  constructor({
    source,
    range,
    sounds,
    power,
    effects,
    flash,
    penetration,
    ...other
  }) {
    super(other);

    this.source = source;
    this.range = range * CELL_SIZE;
    this.sounds = sounds;
    this.power = power;
    this.effects = effects;
    this.parent = source.parent;
    this.flash = flash;
    this.isExplosion = true;

    this.hitScans = ANGLES.map(angle => ({
      hitScan: new HitScan({
        source: this,
        power: this.power,
        range: this.range,
        fade: true,
        penetration,
      }),
      angle,
    }));
  }

  run() {
    this.parent = this.source.parent;
    this.x = this.source.x;
    this.y = this.source.y;

    const distanceToPlayer = this.source.getDistanceTo(this.parent.player);
    const shake = (CELL_SIZE / distanceToPlayer) * (this.power / CELL_SIZE);
    const range = Math.ceil(this.range / CELL_SIZE);
    const deadBodies = [];

    if (this.range > 0) {
      // Make dead bodies collideable and updateable for this frame,
      // so that an explosion will apply a force to them.
      this.parent.getNeighbourBodies(this.source, range).forEach(body => {
        if (body.isActor && body.isDead()) {
          body.startUpdates();
          body.blocking = true;
          deadBodies.push(body);
        }
      });

      // Fire rays in all directions.
      this.hitScans.forEach(({ hitScan, angle }) => hitScan.run(angle));

      // Stop dead bodies from colliding.
      deadBodies.forEach(body => {
        body.blocking = false;
      });
    }

    this.parent.addEffect({
      x: this.source.x,
      y: this.source.y,
      z: this.source.z,
      sourceId: `${this.id}_${this.effects.explode}`,
    });

    this.parent.addFlashLight(this.flash);

    this.parent.addShake(shake);

    this.source.emitSound(this.sounds.explode);
  }

  destroy() {
    super.destroy();
    this.hitScans.forEach(({ hitScan }) => hitScan.destroy());
    this.source = null;
  }
}
