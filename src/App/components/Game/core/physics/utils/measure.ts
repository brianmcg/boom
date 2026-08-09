/**
 * How far apart two positions are, and which way one lies from the other.
 *
 * Free functions rather than {@link Point} methods because they take
 * {@link Positioned} — a body, a cell, an effect — and in practice nobody
 * passes a `Point` to them at all. `Point.distanceTo`/`angleTo` delegate here
 * for the cases where you do hold one.
 */
import { DEG_360 } from './degrees';
import type Point from '../geometry/Point';

export const getDistanceBetween = (from: Point, to: Point): number => {
  const dx = from.x - to.x;
  const dy = from.y - to.y;

  return Math.sqrt(dx * dx + dy * dy);
};

/** Radians from `from` to `to`, normalised to `[0, 2π)`. */
export const getAngleBetween = (from: Point, to: Point): number => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  const angle = Math.atan2(dy, dx) % DEG_360;

  return angle < 0 ? angle + DEG_360 : angle;
};
