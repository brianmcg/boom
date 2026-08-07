import { EventEmitter } from '@game/core/graphics';
import { CELL_SIZE } from '@constants/config';
import type { Transparency } from '../constants';
import type { Line } from '../types';
import Point from './Point';
import Shape from './Shape';
import type World from './World';
import {
  isLineShapeIntersection,
  getLineShapeIntersectionDistance,
} from '../utils/intersections';

let idCount = 0;

const generateId = (body: Body): string => {
  idCount += 1;
  return `${body.constructor.name}_${idCount}`;
};

export interface BodyOptions {
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  length?: number;
  height?: number;
  blocking?: boolean;
  anchor?: number;
}

/**
 * Members that only some bodies have, declared here because `World` and
 * `DynamicBody` reach for them on any `Body` they are handed.
 *
 * Merged into the class as an interface rather than declared in the class body:
 * an interface emits nothing at runtime, and method syntax (rather than a
 * function-typed property) is what lets subclasses implement them as real
 * methods.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- deliberate: see above
export interface Body {
  /** Start receiving `update` calls as soon as the body is added to a world. */
  autoPlay?: boolean;
  onAdded?(parent: World): void;
  onRemoved?(): void;
  update?(delta: number, elapsedMS: number): void;
  /** Set by `Cell`; read here so collision code can treat any body uniformly. */
  transparency?: Transparency;
}

/**
 * An axis-aligned box in the world grid. Bodies are positioned by their centre
 * point, but collide and raycast against the top-left-anchored `shape`.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- merges with the interface above
export class Body extends EventEmitter {
  readonly id: string;

  /**
   * Where the body is. A body *has* a position rather than being one, so it
   * holds a {@link Point} rather than a loose pair of numbers — which is what
   * lets `getDistanceTo` and friends take a `Point` and mean it.
   *
   * `readonly` so two bodies can never end up sharing one by assignment.
   * Moving a body mutates `pos.x`/`pos.y`, usually through the accessors below.
   *
   * `z` stays a field of its own: the grid is two-dimensional and `z` is
   * elevation above it, not part of the position within it.
   */
  readonly pos: Point;

  z: number;

  readonly width: number;
  readonly length: number;

  /** Mutable: the player crouches and dies by changing its height. */
  height: number;

  /** Whether the body stops movement and rays. Doors and corpses toggle this. */
  blocking: boolean;

  readonly anchor: number;

  /** The world this body belongs to, or null once removed. */
  parent: World | null = null;

  /**
   * `x` and `y` delegate to {@link pos}.
   *
   * These are the module's only accessors, and they are the exception the
   * conventions doc allows for: not enforcing an invariant, just keeping one
   * representation behind an API that ~200 call sites in unchecked
   * JavaScript already use. Reads and writes both behave exactly as the plain
   * fields did.
   *
   * The one visible difference is that `x`/`y` now live on the prototype
   * rather than on the instance, so they no longer appear in `Object.keys` or
   * a spread. Nothing in the codebase does either to a body; `equivalence`'s
   * cell-shape audit does, and carries a shim for it.
   */
  get x(): number {
    return this.pos.x;
  }

  set x(value: number) {
    this.pos.x = value;
  }

  get y(): number {
    return this.pos.y;
  }

  set y(value: number) {
    this.pos.y = value;
  }

  constructor({
    x = 0,
    y = 0,
    z = 0,
    width = CELL_SIZE * 0.5,
    length = CELL_SIZE * 0.5,
    height = CELL_SIZE * 0.5,
    blocking = true,
    anchor = 1,
  }: BodyOptions = {}) {
    super();

    this.id = generateId(this);
    this.pos = new Point(x, y);
    this.z = z;
    this.width = width;
    this.length = length;
    this.height = height;
    this.blocking = blocking;
    this.anchor = anchor;
  }

  /** Moves the body and keeps the world's cell index pointing at it. */
  setPos({ x = 0, y = 0, z = 0 }: { x?: number; y?: number; z?: number }) {
    const previousGridX = this.gridX;
    const previousGridY = this.gridY;

    this.x = x;
    this.y = y;
    this.z = z;

    this.reindex(previousGridX, previousGridY);
  }

  /**
   * Re-registers the body with the cell it now stands on.
   *
   * The world finds bodies through the cell they occupy rather than by
   * scanning a list, so a body that moves without updating that index stays
   * findable where it used to be and invisible where it actually is —
   * collisions and raycasts both miss it.
   *
   * Kept as a method rather than folded into an `x`/`y` setter on purpose.
   * `DynamicBody.update` moves one axis at a time and resolves collisions
   * between the two steps, reassigning `x` and `y` several times per frame; a
   * setter would re-index on each of those instead of once around the whole
   * move, and would have to be bypassed to get the batching back — at which
   * point it would be enforcing nothing on the hottest field in the game.
   */
  protected reindex(previousGridX: number, previousGridY: number) {
    if (!this.parent) {
      return;
    }

    const previous = this.parent.getCell(previousGridX, previousGridY);
    const current = this.parent.getCell(this.gridX, this.gridY);

    if (previous === current) {
      return;
    }

    previous?.remove(this);
    current?.add(this);
  }

  removeFromParent() {
    if (this.parent) {
      this.parent.remove(this);
      this.parent = null;
    }
  }

  intersectsLine(line: Line): boolean {
    return isLineShapeIntersection(this.shape, line);
  }

  /** Null is a miss; `0` is a hit from a line starting on this body's edge. */
  getLineIntersectionDistance(line: Line): number | null {
    return getLineShapeIntersectionDistance(this.shape, line);
  }

  /** Accepts any point, not just a body — callers pass bare grid coordinates. */
  getDistanceTo(target: Point): number {
    return this.pos.distanceTo(target);
  }

  destroy(_options?: unknown) {
    this.removeAllListeners();
    this.parent = null;
  }

  get elavation(): number {
    return this.z;
  }

  get gridX(): number {
    return Math.floor(this.x / CELL_SIZE);
  }

  get gridY(): number {
    return Math.floor(this.y / CELL_SIZE);
  }

  /** The body's box, converted from centre-positioned to top-left-positioned. */
  get shape(): Shape {
    return new Shape(
      this.x - this.width / 2,
      this.y - this.length / 2,
      this.width,
      this.length
    );
  }
}

// Declared separately: a class merged with an interface cannot be exported
// inline as the default.
export default Body;
