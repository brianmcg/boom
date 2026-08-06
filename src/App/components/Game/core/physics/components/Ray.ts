import type Body from './Body';
import type Cell from './Cell';
import type { Point, Side } from '../types';

export interface RayOptions {
  startPoint: Point;
  endPoint: Point;
  distance: number;
  encounteredBodies: Record<string, Body>;
  isHorizontal: boolean;
  side: Side | undefined;
  cell: Cell;
  angle: number;
  isOverlay: boolean;
}

/**
 * A single wall layer hit by a ray.
 *
 * `isHorizontal` distinguishes a hit on a horizontal grid line from one on a
 * vertical grid line, which decides whether the texture is sampled along x or
 * y. When `isOverlay` is set, the overlay itself is `cell.overlay`, not the
 * flag — and `side` has already been resolved to it by the caster.
 */
export default class Ray {
  /** Rebased onto the original origin by {@link continueFrom}. */
  startPoint: Point;

  readonly endPoint: Point;

  /** Measured from `startPoint`, so it grows as layers are stitched together. */
  distance: number;

  /** Keyed by body id. The record is fixed; its contents are not. */
  readonly encounteredBodies: Record<string, Body>;

  readonly isHorizontal: boolean;
  readonly side: Side | undefined;
  readonly cell: Cell;
  readonly angle: number;
  readonly isOverlay: boolean;

  constructor({
    startPoint,
    endPoint,
    distance,
    encounteredBodies,
    isHorizontal,
    side,
    cell,
    angle,
    isOverlay,
  }: RayOptions) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.distance = distance;
    this.encounteredBodies = encounteredBodies;
    this.isHorizontal = isHorizontal;
    this.side = side;
    this.cell = cell;
    this.angle = angle;
    this.isOverlay = isOverlay;
  }

  /**
   * Stitches this ray onto the one from the previous wall layer.
   *
   * A ray cast into layer *n* starts where layer *n-1* ended and knows nothing
   * about what came before it, so its distance is measured from that seam and
   * its body set covers only its own span. Rebasing it onto the previous ray
   * makes the pair read as one continuous cast from the original origin.
   */
  continueFrom(previousRay: Ray) {
    this.distance += previousRay.distance;
    this.startPoint = previousRay.startPoint;

    Object.assign(this.encounteredBodies, previousRay.encounteredBodies);
  }
}
