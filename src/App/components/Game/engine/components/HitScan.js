import { CELL_SIZE } from '@constants/config';
import { Body, degrees, castRay } from '@game/core/physics';

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

const OFFSET = CELL_SIZE * 0.0625;

export default class HitScan extends Body {
  constructor({
    effect,
    source,
    power,
    range = Number.MAX_VALUE,
    accuracy = 0,
    fade,
    penetration,
    instantKill,
    ...other
  } = {}) {
    super(other);

    this.source = source;
    this.effect = effect;
    this.power = power;
    this.range = range;
    this.accuracy = accuracy;
    this.fade = fade;
    this.penetration = penetration;
    this.instantKill = instantKill;
  }

  run(angle) {
    const collisionsInRange = [];

    const { isExplosion, parent, x, y } = this.source;

    const sourceId = this.effect && this.id;

    const originAngle = (angle + DEG_180) % DEG_360;

    const rays = castRay({ x, y, angle, world: parent });

    const { startPoint, endPoint, distance, encounteredBodies, cell } =
      rays[rays.length - 1];

    // Get sorted collisions
    const collisions = Object.values(encounteredBodies)
      .reduce((memo, body) => {
        if (body.blocking) {
          const point = body.getRayCollision({ startPoint, endPoint });

          if (point) {
            memo.push({ body, point });
          }

          return memo;
        }
        return memo;
      }, [])
      .sort((a, b) => {
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
          let damage =
            this.power * (Math.floor(Math.random() * this.accuracy) + 1);

          collisionsInRange.push(body);

          if (this.fade) {
            damage *= (this.range - point.distance) / this.range;
          }

          if (i > 0) {
            if (this.penetration) {
              if (
                body.getDistanceTo(collisions[0].body) <
                this.penetration.distance * CELL_SIZE
              ) {
                damage *= this.penetration.fade / i;
              } else {
                damage = 0;
              }
            } else {
              damage = 0;
            }
          }

          // Handle a body that doesn't have it's own impact effect
          if (sourceId && !body.effects?.spurt) {
            parent.addEffect({
              x: body.x + Math.cos(originAngle) * (body.width + OFFSET),
              y: body.y + Math.sin(originAngle) * (body.length + OFFSET),
              sourceId,
            });
          }

          if (damage) {
            if (body.isDestroyable && !(isExplosion && body.isBoss)) {
              body.hit({
                damage,
                angle,
                point,
                rays,
                instantKill: this.instantKill,
              });
            }
          }
        }
      }
    } else if (!cell.edge && distance <= this.range) {
      collisionsInRange.push(cell);

      // Handle collision with wall
      if (sourceId) {
        parent.addEffect({
          x: endPoint.x + Math.cos(originAngle) * OFFSET,
          y: endPoint.y + Math.sin(originAngle) * OFFSET,
          sourceId,
        });
      }
    }

    return collisionsInRange;
  }
}
