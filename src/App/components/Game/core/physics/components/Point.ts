import { DEG_360 } from '../utils/degrees';
import type { Positioned } from '../types';

export const getDistanceBetween = (
  from: Positioned,
  to: Positioned
): number => {
  const dx = from.x - to.x;
  const dy = from.y - to.y;

  return Math.sqrt(dx * dx + dy * dy);
};

/** Radians from `from` to `to`, normalised to `[0, 2π)`. */
export const getAngleBetween = (from: Positioned, to: Positioned): number => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  const angle = Math.atan2(dy, dx) % DEG_360;

  return angle < 0 ? angle + DEG_360 : angle;
};

/**
 * A position in world space.
 *
 * Per the module's house style this is a value object, so it takes its two
 * numbers positionally rather than an options object.
 *
 * `Point` is for a field that *holds* a position. Anything that merely *has*
 * one — a body, a cell, an effect — is {@link Positioned}, which is why the two
 * functions above are free functions taking that instead of methods on this
 * class: in practice nobody passes a `Point` to them at all.
 */
export default class Point implements Positioned {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  distanceTo(other: Positioned): number {
    return getDistanceBetween(this, other);
  }

  angleTo(other: Positioned): number {
    return getAngleBetween(this, other);
  }
}
