import { CELL_SIZE } from 'game/constants/config';
import { Body, degrees, castRay } from 'game/core/physics';

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

const OFFSET = CELL_SIZE * 0.0625;

const SECONDARY_DAMAGE_FADE = 0.6;

const SECONDARY_DAMAGE_DISTANCE = Math.sqrt(
  (CELL_SIZE * CELL_SIZE) + (CELL_SIZE * CELL_SIZE),
);

/**
 * Class representing a hit scan.
 * @extends {Body}
 */
class HitScan extends Body {
  /**
   * Creates a hit scan.
   * @param  {Number}  options.x            The x coordinate of the body.
   * @param  {Number}  options.y            The y coordinate of the body.
   * @param  {Number}  options.z            The z coordinate of the body.
   * @param  {Number}  options.width        The width of the body.
   * @param  {Number}  options.height       The length of the body.
   * @param  {Number}  options.height       The height of the body.
   * @param  {Boolean} options.blocking     The blocking value of the body.
   * @param  {Number}  options.anchor       The anchor of the body.
   * @param  {String}  options.effect       The impact effect.
   * @param  {Body}    options.source       The source of the hitscan.
   * @param  {Number}  options.power        The power of the hitscan.
   * @param  {Number}  options.range        The range of the hitscan.
   * @param  {Number}  options.accuracy     The accuracy of the hitscan.
   * @param  {Number}  options.fade         The fade of the hitscan.
   * @param  {Boolean} options.highCalibre  The calibre of the hitscan.
   * @param  {Boolean} options.flash        The flash property of the hitscan.
   */
  constructor({
    effect,
    source,
    power,
    range = Number.MAX_VALUE,
    accuracy = 0,
    fade,
    highCalibre = false,
    flash = true,
    ...other
  } = {}) {
    super(other);

    this.source = source;
    this.effect = effect;
    this.power = power;
    this.range = range;
    this.accuracy = accuracy;
    this.fade = fade;
    this.highCalibre = highCalibre;
    this.flash = flash;
  }

  /**
   * Execute the hit scan.
   * @param  {Number} angle The angle of the hitscan.
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
      cell,
    } = rays[rays.length - 1];

    if (this.flash) {
      this.source.parent.addFlash(this.power);
    }

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
      for (let i = 0; i < collisions.length; i++) {
        const { point, body } = collisions[i];

        if (point.distance <= this.range) {
          let damage = this.power * (Math.floor(Math.random() * this.accuracy) + 1);

          if (this.fade) {
            damage *= ((this.range - point.distance) / this.range);
          }

          if (i > 0) {
            if (this.highCalibre) {
              if (body.getDistanceTo(collisions[0].body) < SECONDARY_DAMAGE_DISTANCE) {
                damage *= (SECONDARY_DAMAGE_FADE / i);
              } else {
                damage = 0;
              }
            } else {
              damage = 0;
            }
          }

          if (damage) {
            if (sourceId) {
              this.source.parent.addEffect({
                x: point.x + Math.cos(originAngle) * OFFSET,
                y: point.y + Math.sin(originAngle) * OFFSET,
                sourceId,
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
        }
      }
    } else if (!cell.edge && distance <= this.range) {
      // Handle collision with wall
      if (sourceId) {
        this.source.parent.addEffect({
          x: endPoint.x + Math.cos(originAngle) * OFFSET,
          y: endPoint.y + Math.sin(originAngle) * OFFSET,
          sourceId,
        });
      }
    }
  }
}

export default HitScan;
