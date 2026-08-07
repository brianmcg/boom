import { getAngleBetween, getDistanceBetween } from '../utils/measure';
import type { Positioned } from '../types';

/**
 * A position in world space.
 *
 * Per the module's house style this is a value object, so it takes its two
 * numbers positionally rather than an options object.
 *
 * `Point` is for a field that *holds* a position. Anything that merely *has*
 * one — a body, a cell, an effect — is {@link Positioned}, which is why the
 * measuring functions these methods delegate to live in `utils/measure.ts` and
 * take that instead.
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
