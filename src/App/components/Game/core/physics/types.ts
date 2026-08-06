import type Cell from './components/Cell';

/** A point in world space. Units are world units, not grid cells. */
export interface Point {
  x: number;
  y: number;
}

/** An axis-aligned bounding box, positioned by its top-left corner. */
export interface Shape {
  x: number;
  y: number;
  width: number;
  length: number;
}

/** A line segment, as consumed by the intersection helpers. */
export interface Line {
  startPoint: Point;
  endPoint: Point;
}

/**
 * One face of a cell: which texture to draw, how tall to draw it, and how much
 * blood has been splattered on it. Absent when the face is never drawn.
 */
export interface Side {
  name: string;
  height: number;
  spatter: number;
}

/** The point at which a ray crossed a line, and how far along the ray it was. */
export interface RayCollision extends Point {
  distance: number;
}

/**
 * The raycaster's view of a body: enough to test a ray against it and to key it
 * in an `encounteredBodies` map.
 */
export interface RaycastableBody {
  id: string;
  x: number;
  y: number;
  shape: Shape;
}

/** The raycaster's view of the world: a bounded grid it can look cells up in. */
export interface RaycastableWorld {
  width: number;
  length: number;
  getCell(x: number, y: number): Cell | null;
}

/**
 * A single wall layer hit by a ray.
 *
 * `isHorizontal` distinguishes a hit on a horizontal grid line from one on a
 * vertical grid line, which decides whether the texture is sampled along x or
 * y. When `isOverlay` is set, the overlay itself is `cell.overlay`, not the
 * flag.
 */
export interface Ray {
  startPoint: Point;
  endPoint: Point;
  distance: number;
  encounteredBodies: Record<string, RaycastableBody>;
  isHorizontal: boolean;
  side: Side | undefined;
  cell: Cell;
  angle: number;
  isOverlay: boolean;
}

export interface CastRayOptions {
  x: number;
  y: number;
  angle: number;
  world: RaycastableWorld;
  /** Cast from inside a partially-open cell before stepping to the next one. */
  checkInitialCell?: boolean;
  ignoreOverlay?: boolean;
  /** Height of the ray; cells no taller than this are passed straight through. */
  elavation?: number;
  /** Offsets the ray's origin along its own angle, so a body doesn't hit itself. */
  radius?: number;
}
