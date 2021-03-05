import { Body, degrees } from 'game/core/physics';

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

/**
 * Class representing a hit scan.
 */
class Explosion extends Body {
  constructor({
    source,
    range,
    sounds,
    power,
    effects,
    ...other
  }) {
    super(other);

    this.source = source;
    this.range = range;
    this.sounds = sounds;
    this.power = power;
    this.effects = effects;
  }

  run() {
    this.source.parent.addEffect({
      x: this.source.x,
      y: this.source.y,
      z: this.source.z,
      sourceId: `${this.id}_${this.effects.explode}`,
      flash: this.power,
      shake: this.power,
    });

    this.source.parent.getAdjacentBodies(this.source, this.range).forEach((body) => {
      if (body.isDestroyable) {
        const angle = (body.getAngleTo(this.source) - DEG_180 + DEG_360) % DEG_360;
        const distance = this.source.getDistanceTo(body);
        const damage = Math.max(1, this.power - Math.round(distance));

        body.addHit({ damage, angle });
      }
    });

    this.source.emitSound(this.sounds.explode);
  }
}

export default Explosion;
