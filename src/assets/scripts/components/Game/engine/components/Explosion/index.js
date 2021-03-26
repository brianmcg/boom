import { CELL_SIZE } from 'game/constants/config';
import { Body, degrees } from 'game/core/physics';
import HitScan from '../HitScan';

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

const SPREAD = 24;

const INCREMENT = 360 / 24;

const ANGLES = [...Array(SPREAD).keys()].map(i => degrees(i * INCREMENT));

/**
 * Class representing a hit scan.
 */
class Explosion extends Body {
  /**
   * Creates an explosion.
   * @param  {Body}      options.source  The source of the explosion.
   * @param  {Number}    options.range   The range of the explosion.
   * @param  {Object}    options.sounds  The explosion sounds.
   * @param  {Number}    options.power   The power of the explosion.
   * @param  {Object}    options.effects The explosion effects.
   * @param  {...Object} options.other   The body options.
   */
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
    this.range = range * CELL_SIZE;
    this.sounds = sounds;
    this.power = power;
    this.effects = effects;
    this.parent = source.parent;
  }

  /**
   * Run the explosion.
   */
  run() {
    this.parent = this.source.parent;
    this.x = this.source.x;
    this.y = this.source.y;

    const distanceToPlayer = this.source.getDistanceTo(this.parent.player);
    const shake = (CELL_SIZE / distanceToPlayer) * (this.power / (CELL_SIZE));
    const range = Math.ceil(this.range / CELL_SIZE);
    const deadBodies = [];

    if (this.range > 0) {
      // Make dead bodies collideable and updateable for this frame,
      // so that an explosion will apply a force to them.
      this.parent.getAdjacentBodies(this.source, range).forEach((body) => {
        if (body.isActor && body.isDead()) {
          body.startUpdates();
          body.blocking = true;
          deadBodies.push(body);
        }
      });

      // Fire rays in all directions.
      ANGLES.forEach((angle) => new HitScan({
        source: this,
        power: this.power,
        range: this.range,
        fade: true,
      }).run(angle));

      // Stop dead bodies from colliding.
      deadBodies.forEach((body) => {
        body.blocking = false;
      });
    }

    this.parent.addEffect({
      x: this.source.x,
      y: this.source.y,
      z: this.source.z,
      sourceId: `${this.id}_${this.effects.explode}`,
      flash: this.power,
      shake,
    });

    this.source.emitSound(this.sounds.explode);
  }
}

export default Explosion;
