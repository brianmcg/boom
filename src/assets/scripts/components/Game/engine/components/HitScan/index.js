import { CELL_SIZE } from 'game/constants/config';
import { Body, degrees } from 'game/core/physics';

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

const SPATTER_DISTANCE = CELL_SIZE * 1.5;

/**
 * Class representing a hit scan.
 */
class HitScan extends Body {
  /**
   * Creates a hit scan.
   * @extends {Body}
   * @param   {String} options.effect The impact effect.
   */
  constructor({ effect } = {}) {
    super({
      width: CELL_SIZE / 8,
      height: CELL_SIZE / 8,
    });

    this.effect = effect;
  }

  /**
   * Execute the hit scan.
   * @param  {Object} options.ray       The ray data.
   * @param  {Number} options.damage    The damage amount.
   * @param  {World}  options.parent    The world.
   * @param  {Number} options.range     The range of the hit.
   * @param  {Number} options.power     The power of the hit.
   */
  execute({
    ray,
    damage,
    parent,
    range,
    power,
  }) {
    const {
      startPoint,
      endPoint,
      distance,
      side,
      encounteredBodies,
      angle,
    } = ray;

    const originAngle = (angle + DEG_180) % DEG_360;

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

      if (point.distance <= range) {
        if (body.isDestroyable) {
          // Handle destroyable object collision.
          const sourceId = body.effects?.spurt
            ? `${body.id}_${body.effects.spurt}`
            : this.effect && this.id;

          if (sourceId) {
            parent.addEffect({
              x: point.x + Math.cos(originAngle) * (CELL_SIZE / 16),
              y: point.y + Math.sin(originAngle) * (CELL_SIZE / 16),
              sourceId,
              flash: power,
            });
          }

          body.addHit({ damage, angle });

          if (
            body.spatter
              && !side.spatter
              && distance - point.distance < SPATTER_DISTANCE

          ) {
            side.spatter = body.spatter();
          }
        } else {
          // Handle static object collision.
          const sourceId = this.effect && this.id;

          if (sourceId) {
            parent.addEffect({
              x: point.x + Math.cos(originAngle) * (CELL_SIZE / 16),
              y: point.y + Math.sin(originAngle) * (CELL_SIZE / 16),
              sourceId,
              flash: power,
            });
          }
        }
      }
    } else if (distance <= range) {
      // Handle collision with wall
      const sourceId = this.effect && this.id;

      if (sourceId) {
        parent.addEffect({
          x: endPoint.x + Math.cos(originAngle) * (CELL_SIZE / 16),
          y: endPoint.y + Math.sin(originAngle) * (CELL_SIZE / 16),
          sourceId,
          flash: power,
        });
      }
    }
  }
}

export default HitScan;
