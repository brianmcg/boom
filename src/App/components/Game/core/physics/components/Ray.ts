import type Body from './Body';
import type Cell from './Cell';
import type { Point, Side } from '../types';

/**
 * A single wall layer hit by a ray.
 *
 * `isHorizontal` distinguishes a hit on a horizontal grid line from one on a
 * vertical grid line, which decides whether the texture is sampled along x or
 * y. When `isOverlay` is set, the overlay itself is `cell.overlay`, not the
 * flag — and `side` has already been resolved to it by the caster.
 *
 * Rays are allocated per screen column, per wall layer, every frame, so the
 * constructor stays plain assignments. Declare the fields in the order the
 * constructor assigns them: the declarations give V8 a complete hidden class
 * up front, which measures faster than letting the assignments build one by
 * transition, and it keeps the property order matching the rest of the module.
 */
export default class Ray {
  startPoint: Point;
  endPoint: Point;
  distance: number;
  encounteredBodies: Record<string, Body>;
  isHorizontal: boolean;
  side: Side | undefined;
  cell: Cell;
  angle: number;
  isOverlay: boolean;

  constructor(
    startPoint: Point,
    endPoint: Point,
    distance: number,
    encounteredBodies: Record<string, Body>,
    isHorizontal: boolean,
    side: Side | undefined,
    cell: Cell,
    angle: number,
    isOverlay: boolean
  ) {
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
