import { CELL_SIZE } from '@constants/config';
import { degrees, castRay, type Body, type Point } from '@game/core/physics';
import { generateId } from '@game/core/utils';
import AbstractDestroyableEntity from '../base/AbstractDestroyableEntity';
import type World from '../World';

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

const OFFSET = CELL_SIZE * 0.0625;

/** How far a shot carries past the first body it hits, and at what cost. */
export interface Penetration {
  /** In cells, measured from the first body struck. */
  distance: number;
  fade: number;
}

/**
 * What a scan needs from whatever fired it: where the shot starts, the world
 * to cast into, and whether it came from an explosion.
 *
 * Structural rather than a union of `Explosion | Player`, because `Explosion`
 * imports this module — naming it here would be a cycle — and because these
 * three members are the whole of what `run` asks for.
 *
 * The position is a `Point` rather than a pair of numbers on purpose. Per the
 * note on that class there is no "something with coordinates" type: a bare
 * `{ x, y }` must not satisfy a position, or a sprite would qualify as one.
 */
export interface HitScanSource {
  pos: Point;
  parent: World | null;
  /** Set only by `Explosion`; a blast spares a boss its own damage. */
  isExplosion?: boolean;
}

/** One body the ray crossed, and how far along the ray it stands. */
interface Collision {
  body: Body;
  distance: number;
}

export interface HitScanOptions {
  source: HitScanSource;
  power: number;
  effect?: string;
  range?: number;
  accuracy?: number;
  fade?: boolean;
  penetration?: Penetration;
  instantKill?: boolean;
}

/**
 * An instant shot along one angle: cast a ray, sort what it crossed by
 * distance, and apply damage and an impact effect to each in turn.
 *
 * Not a `Body`, and has no position of its own — it casts from wherever its
 * source stands. It extended `Body` for one thing, the id below, and inherited
 * a shape, a size and a place in the grid it never used.
 */
export default class HitScan {
  /**
   * Keys the impact effect's sprite, which `WorldGraphics` builds one of per
   * scan before the level starts.
   */
  readonly id = generateId(this);

  readonly source: HitScanSource;

  /** The impact effect's name, or absent for a shot that leaves no mark. */
  effect?: string;

  power: number;

  range: number;

  accuracy: number;

  /** Damage falls off with distance across the range. */
  fade?: boolean;

  penetration?: Penetration;

  instantKill?: boolean;

  constructor({
    effect,
    source,
    power,
    range = Number.MAX_VALUE,
    accuracy = 0,
    fade,
    penetration,
    instantKill,
  }: HitScanOptions) {
    this.source = source;
    this.effect = effect;
    this.power = power;
    this.range = range;
    this.accuracy = accuracy;
    this.fade = fade;
    this.penetration = penetration;
    this.instantKill = instantKill;
  }

  run(angle: number): Body[] {
    const collisionsInRange: Body[] = [];

    const { isExplosion, parent, pos } = this.source;

    const sourceId = this.effect && this.id;

    const originAngle = (angle + DEG_180) % DEG_360;

    const rays = castRay({ x: pos.x, y: pos.y, angle, world: parent! });

    const { startPoint, endPoint, distance, encounteredBodies, cell } =
      rays[rays.length - 1];

    // Get sorted collisions
    const collisions = Object.values(encounteredBodies)
      .reduce<Collision[]>((memo, body) => {
        if (body.blocking) {
          const hitDistance = body.getLineIntersectionDistance({
            startPoint,
            endPoint,
          });

          // Not `if (hitDistance)`: 0 is a real hit, from a shot that starts
          // exactly on the body's edge.
          if (hitDistance !== null) {
            memo.push({ body, distance: hitDistance });
          }

          return memo;
        }
        return memo;
      }, [])
      .sort((a, b) => a.distance - b.distance);

    if (collisions.length) {
      // Handle collision with object.
      for (let i = 0; i < collisions.length; i++) {
        const { distance: hitDistance, body } = collisions[i];

        if (hitDistance <= this.range) {
          let damage =
            this.power * (Math.floor(Math.random() * this.accuracy) + 1);

          collisionsInRange.push(body);

          if (this.fade) {
            damage *= (this.range - hitDistance) / this.range;
          }

          if (i > 0) {
            if (this.penetration) {
              if (
                body.getDistanceTo(collisions[0].body.pos) <
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
          const hasOwnSpurt =
            body instanceof AbstractDestroyableEntity && !!body.effects?.spurt;

          if (sourceId && !hasOwnSpurt) {
            parent!.addEffect({
              x: body.x + Math.cos(originAngle) * (body.width + OFFSET),
              y: body.y + Math.sin(originAngle) * (body.length + OFFSET),
              sourceId,
            });
          }

          if (damage) {
            // `isBoss` is `AbstractEnemy`'s, which is still JavaScript, so it
            // is asked for by name rather than by narrowing to that class.
            const isShieldedBoss =
              !!isExplosion && 'isBoss' in body && !!body.isBoss;

            if (body instanceof AbstractDestroyableEntity && !isShieldedBoss) {
              body.hit({
                damage,
                angle,
                distance: hitDistance,
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
        parent!.addEffect({
          x: endPoint.x + Math.cos(originAngle) * OFFSET,
          y: endPoint.y + Math.sin(originAngle) * OFFSET,
          sourceId,
        });
      }
    }

    return collisionsInRange;
  }
}
