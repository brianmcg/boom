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
 * constructor stays plain assignments and the fields are `declare`d: under
 * `useDefineForClassFields` a real field declaration would emit a define
 * *and* an assignment, doubling the writes per ray. `declare` erases
 * completely, leaving the same cost as the object literal this replaced.
 */
export default class Ray {
  declare startPoint: Point;
  declare endPoint: Point;
  declare distance: number;
  declare encounteredBodies: Record<string, Body>;
  declare isHorizontal: boolean;
  declare side: Side | undefined;
  declare cell: Cell;
  declare angle: number;
  declare isOverlay: boolean;

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
