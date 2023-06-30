import { CELL_SIZE } from '@game/constants/config';
import { Body, degrees } from '@game/core/physics';
import HitScan from '../HitScan';

const SPREAD = 24;

const INCREMENT = 360 / 24;

const ANGLES = [...Array(SPREAD).keys()].map(i => degrees(i * INCREMENT));

/**
 * Class representing a hit scan.
 * @extends {Body}
 */
class Explosion extends Body {
  /**
   * Creates an explosion.
   * @param  {Number}  options.x            The x coordinate of the body.
   * @param  {Number}  options.y            The y coordinate of the body.
   * @param  {Number}  options.z            The z coordinate of the body.
   * @param  {Number}  options.width        The width of the body.
   * @param  {Number}  options.height       The length of the body.
   * @param  {Number}  options.height       The height of the body.
   * @param  {Boolean} options.blocking     The blocking value of the body.
   * @param  {Number}  options.anchor       The anchor of the body.
   * @param  {Body}    options.source       The source of the explosion.
   * @param  {Number}  options.range        The range of the explosion.
   * @param  {Object}  options.sounds       The explosion sounds.
   * @param  {Number}  options.power        The power of the explosion.
   * @param  {Object}  options.effects      The explosion effects.
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
    this.isExplosion = true;

    this.hitScans = ANGLES.map(angle => ({
      hitScan: new HitScan({
        source: this,
        power: this.power,
        range: this.range,
        fade: true,
        highCalibre: true,
      }),
      angle,
    }));
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
      this.parent.getNeighbourBodies(this.source, range).forEach((body) => {
        if (body.isActor && body.isDead()) {
          body.startUpdates();
          body.blocking = true;
          deadBodies.push(body);
        }
      });

      // Fire rays in all directions.
      this.hitScans.forEach(({ hitScan, angle }) => hitScan.run(angle));

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
    });

    this.parent.addShake(shake);

    this.source.emitSound(this.sounds.explode);
  }
}

export default Explosion;
