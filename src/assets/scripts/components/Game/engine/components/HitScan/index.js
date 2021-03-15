import { CELL_SIZE } from 'game/constants/config';
import { Body, degrees, castRay } from 'game/core/physics';

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

const SPATTER_DISTANCE = Math.sqrt((CELL_SIZE * CELL_SIZE) + (CELL_SIZE * CELL_SIZE));

const OFFSET_MULTIPLIER = CELL_SIZE * 0.0625;

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
    accuracy,
    ...other
  } = {}) {
    super(other);

    this.source = source;
    this.effect = effect;
    this.power = power;
    this.range = range;
    this.accuracy = accuracy;
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

    const {
      startPoint,
      endPoint,
      distance,
      encounteredBodies,
    } = rays[rays.length - 1];


    const originAngle = (angle + DEG_180) % DEG_360;

    const damage = this.power * (Math.floor(Math.random() * this.accuracy) + 1);

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
      const { point, body } = collisions[0];

      if (point.distance <= this.range) {
        if (body.isDestroyable) {
          // Handle destroyable object collision.
          const sourceId = body.effects?.spurt
            ? `${body.id}_${body.effects.spurt}`
            : this.effect && this.id;

          if (sourceId) {
            this.source.parent.addEffect({
              x: point.x + Math.cos(originAngle) * OFFSET_MULTIPLIER,
              y: point.y + Math.sin(originAngle) * OFFSET_MULTIPLIER,
              sourceId,
              flash: this.power,
            });
          }

          body.hit({ damage, angle });

          const { side, distance: sectionDistance } = rays.reduce((memo, ray) => {
            if (ray.distance > point.distance) {
              if (ray.distance < memo.distance) {
                return ray;
              }
              return memo;
            }
            return memo;
          }, {
            side: {},
            distance: Number.MAX_VALUE,
          });

          if (
            body.spatter
              && !side.spatter
              && sectionDistance - point.distance < SPATTER_DISTANCE

          ) {
            side.spatter = body.spatter();
          }
        } else {
          // Handle static object collision.
          const sourceId = this.effect && this.id;

          if (sourceId) {
            this.source.parent.addEffect({
              x: point.x + Math.cos(originAngle) * OFFSET_MULTIPLIER,
              y: point.y + Math.sin(originAngle) * OFFSET_MULTIPLIER,
              sourceId,
              flash: this.power,
            });
          }
        }
      }
    } else if (distance <= this.range) {
      // Handle collision with wall
      const sourceId = this.effect && this.id;

      if (sourceId) {
        this.source.parent.addEffect({
          x: endPoint.x + Math.cos(originAngle) * OFFSET_MULTIPLIER,
          y: endPoint.y + Math.sin(originAngle) * OFFSET_MULTIPLIER,
          sourceId,
          flash: this.power,
        });
      }
    }
  }
}

export default HitScan;
