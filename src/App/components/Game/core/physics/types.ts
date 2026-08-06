/**
 * Shared types for the physics module.
 *
 * Absence has two meanings here, and the split is deliberate. `null` marks a
 * slot that held a value and was cleared, or a lookup that computed to nothing
 * — `Body.parent` after `destroy()`, `World.getCell()` out of bounds,
 * `getRayCollision()` with no intersection. `undefined` marks something never
 * supplied — a constructor option left off, or a cell face the map data never
 * defined. That is why `Ray.side` is `Side | undefined` rather than
 * `Side | null`: it passes through `Cell.front`/`left`/`back`/`right`
 * unchanged, and those come straight from the map.
 */
import type Cell from './components/Cell';

/**
 * Anything with a position in world space. Units are world units, not grid
 * cells.
 *
 * This is the *parameter* type: `Body` and `Cell` carry their own `x`/`y` and
 * are handed to the point helpers directly, so a signature demanding a real
 * {@link Point} would reject them. Fields that hold a position use the `Point`
 * class instead.
 */
export interface PointLike {
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
  startPoint: PointLike;
  endPoint: PointLike;
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
export interface RayCollision extends PointLike {
  distance: number;
}

/** The raycaster's view of the world: a bounded grid it can look cells up in. */
export interface RaycastableWorld {
  width: number;
  length: number;
  getCell(x: number, y: number): Cell | null;
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
