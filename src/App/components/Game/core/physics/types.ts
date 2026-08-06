import type { Axis, Transparency } from './constants';

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

/**
 * The raycaster's view of a cell. Everything here is read by `castRaySection` /
 * `castCellRay`, which is why `Cell` declares all of it rather than leaving it
 * to the game layer to bolt on.
 */
export interface RaycastableCell extends RaycastableBody {
  bodies: RaycastableBody[];
  blocking: boolean;
  height: number;
  gridX: number;
  gridY: number;
  /** Alignment of a door or push wall. Falsy on a plain cell, which reads as a solid wall. */
  axis?: Axis | null;
  /** How far the cell has slid open, in world units, per axis. */
  offset: Point;
  transparency: Transparency;
  isDoor: boolean;
  isPushWall: boolean;
  double: boolean;
  reverse: boolean;
  front?: Side;
  left?: Side;
  back?: Side;
  right?: Side;
  /** A second surface drawn in front of the cell's own face, e.g. a door frame. */
  overlay?: Side;
}

/** The raycaster's view of the world: a bounded grid it can look cells up in. */
export interface RaycastableWorld {
  width: number;
  length: number;
  getCell(x: number, y: number): RaycastableCell | null;
}

/**
 * A single wall layer hit by a ray.
 *
 * Note `isHorizontal` is absent (not `false`) when the ray hit a vertical grid
 * line, and `isOverlay` holds the overlay `Side` itself rather than a boolean.
 * Both quirks are load-bearing for the POV renderer.
 */
export interface Ray {
  startPoint: Point;
  endPoint: Point;
  distance: number;
  encounteredBodies: Record<string, RaycastableBody>;
  isHorizontal?: true;
  side: Side | undefined;
  cell: RaycastableCell;
  angle: number;
  isOverlay: Side | false | undefined;
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
