import { CELL_SIZE } from 'game/constants/config';
import { Body, degrees, castRay } from 'game/core/physics';

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

const OFFSET = CELL_SIZE * 0.0625;

/**
 * Class representing a hit scan.
 */
class HitScan extends Body {
  /**
   * Creates a hit scan.
   * @extends {Body}
   * @param   {String} options.effect The impact effect.
   */
  constructor({
    effect,
    source,
    power,
    range,
    accuracy = 0,
    fade,
    ...other
  } = {}) {
    super(other);

    this.source = source;
    this.effect = effect;
    this.power = power;
    this.range = range;
    this.accuracy = accuracy;
    this.fade = fade;
  }

  /**
   * Execute the hit scan.
   * @param  {Object} options.ray       The ray data.
   * @param  {Number} options.damage    The damage amount.
   * @param  {World}  options.parent    The world.
   * @param  {Number} options.range     The range of the hit.
   * @param  {Number} options.power     The power of the hit.
   */
  run(angle) {
    const rays = castRay({
      x: this.source.x,
      y: this.source.y,
      angle,
      world: this.source.parent,
    });

    const originAngle = (angle + DEG_180) % DEG_360;

    const sourceId = this.effect && this.id;

    const {
      startPoint,
      endPoint,
      distance,
      encounteredBodies,
    } = rays[rays.length - 1];

    // Get sorted collisions
    const collisions = Object.values(encounteredBodies).reduce((memo, body) => {
      if (body.blocking) {
        const point = body.getRayCollision({ startPoint, endPoint });

        if (point) {
          memo.push({ body, point });
        }

        return memo;
      }
      return memo;
    }, []).sort((a, b) => {
      if (a.point.distance > b.point.distance) {
        return 1;
      }

      if (a.point.distance < b.point.distance) {
        return -1;
      }

      return 0;
    });

    if (collisions.length) {
      // Handle collision with object.
      // TODO: handle multiple collisions.
      const { point, body } = collisions[0];

      if (point.distance <= this.range) {
        let damage = this.power * (Math.floor(Math.random() * this.accuracy) + 1);

        if (this.fade) {
          damage *= ((this.range - point.distance) / this.range);
        }

        if (sourceId) {
          this.source.parent.addEffect({
            x: point.x + Math.cos(originAngle) * OFFSET,
            y: point.y + Math.sin(originAngle) * OFFSET,
            sourceId,
            flash: this.power,
          });
        }

        if (body.isDestroyable) {
          body.hit({
            damage,
            angle,
            point,
            rays,
          });
        }
      }
    } else if (distance <= this.range) {
      // Handle collision with wall
      if (sourceId) {
        this.source.parent.addEffect({
          x: endPoint.x + Math.cos(originAngle) * OFFSET,
          y: endPoint.y + Math.sin(originAngle) * OFFSET,
          sourceId,
          flash: this.power,
        });
      }
    }
  }
}

export default HitScan;
