import { getAngleBetween, getDistanceBetween } from '../utils/measure';

/**
 * A position in world space.
 *
 * Per the module's house style this is a value object, so it takes its two
 * numbers positionally rather than an options object.
 *
 * Everything with a position in the world holds one of these — `Body.pos`,
 * `Ray.startPoint`, a `Shape`'s corners, an `Effect`'s `pos`. There is no
 * separate "something that has coordinates" type: a caller that wants to
 * measure against a body passes `body.pos`, which is the position itself.
 *
 * That is what makes this a class rather than an interface. A bare `{ x, y }`
 * does not satisfy it, so a body, cell or sprite cannot be passed where a
 * position belongs.
 */
export default class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  distanceTo(other: Point): number {
    return getDistanceBetween(this, other);
  }

  angleTo(other: Point): number {
    return getAngleBetween(this, other);
  }
}
