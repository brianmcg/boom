import { CELL_SIZE } from 'game/constants/config';
import { Body, degrees } from 'game/core/physics';

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

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
    this.range = range;
    this.sounds = sounds;
    this.power = power;
    this.effects = effects;
  }

  /**
   * Run the explosion.
   */
  run() {
    const { parent } = this.source;
    const distanceToPlayer = this.source.getDistanceTo(parent.player);
    const shake = (CELL_SIZE / distanceToPlayer) * (this.power / (CELL_SIZE));

    if (this.range > 0) {
      parent.getAdjacentBodies(this.source, this.range).forEach((body) => {
        if (body.isDestroyable) {
          const distance = this.source.getDistanceTo(body);
          const angle = (body.getAngleTo(this.source) + DEG_180) % DEG_360;
          const damage = Math.max(1, this.power - Math.round(distance));

          if (body.isActor && body.isDead()) {
            body.parent.startUpdates(body);
          }

          body.hit({ damage, angle });
        }
      });
    }

    parent.addEffect({
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
