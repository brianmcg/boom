import { DEG_360 } from '../degrees';
import type { PointLike } from '../types';

export const getDistanceBetween = (
  bodyA: PointLike,
  bodyB: PointLike
): number => {
  const dx = bodyA.x - bodyB.x;
  const dy = bodyA.y - bodyB.y;

  return Math.sqrt(dx * dx + dy * dy);
};

export const getAngleBetween = (bodyA: PointLike, bodyB: PointLike): number => {
  const dx = bodyB.x - bodyA.x;
  const dy = bodyB.y - bodyA.y;

  const angle = Math.atan2(dy, dx) % DEG_360;

  return angle < 0 ? angle + DEG_360 : angle;
};

/**
 * A position in world space.
 *
 * Per the module's house style this is a value object, so it takes its two
 * numbers positionally rather than an options object.
 *
 * Use `Point` for a field that *holds* a position, and {@link PointLike} for a
 * parameter that merely *reads* one — `Body` and `Cell` carry their own
 * `x`/`y` and are handed to these helpers directly, so a signature demanding a
 * real `Point` would reject them. The two functions above stay free functions
 * for exactly that reason: their commonest callers are bodies, not points.
 */
export default class Point implements PointLike {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  distanceTo(other: PointLike): number {
    return getDistanceBetween(this, other);
  }

  angleTo(other: PointLike): number {
    return getAngleBetween(this, other);
  }
}
