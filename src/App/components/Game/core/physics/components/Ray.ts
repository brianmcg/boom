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
 * constructor does nothing but store its arguments. The parameter properties
 * emit as real class fields, which lets V8 build the hidden class from the
 * declaration rather than by transition on each assignment — measurably the
 * faster of the two shapes, and it fixes the property order at the one place
 * the order is written down.
 */
export default class Ray {
  constructor(
    public startPoint: Point,
    public endPoint: Point,
    public distance: number,
    public encounteredBodies: Record<string, Body>,
    public isHorizontal: boolean,
    public side: Side | undefined,
    public cell: Cell,
    public angle: number,
    public isOverlay: boolean
  ) {}

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
