import { EventEmitter } from '@game/core/graphics';
import { CELL_SIZE } from '@constants/config';
import type { Line } from '../types';
import Point from '../geometry/Point';
import Shape from '../geometry/Shape';
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
  width?: number;
  length?: number;
  height?: number;
  blocking?: boolean;
}

/**
 * An axis-aligned box in the world grid. Bodies are positioned by their centre
 * point, but collide and raycast against the top-left-anchored `shape`.
 *
 * It knows nothing about the world it sits in — no `parent`, no lifecycle
 * hooks, no way to move itself between cells. Only the two branches that
 * actually look outward carry that: `DynamicBody` and `DynamicCell` each hold
 * their own `parent`, because they are the only things that ever set or read
 * one, and they meet nowhere lower than here.
 */
export default class Body extends EventEmitter {
  readonly id: string;

  /**
   * Where the body is. A body *has* a position rather than being one, so it
   * holds a {@link Point} rather than a loose pair of numbers — which is what
   * lets `getDistanceTo` and friends take a `Point` and mean it.
   *
   * `readonly` so two bodies can never end up sharing one by assignment.
   * Moving a body mutates `pos.x`/`pos.y`, usually through the accessors below.
   */
  readonly pos: Point;

  readonly width: number;
  readonly length: number;

  /** Mutable: the player sinks as it dies by changing its height. */
  height: number;

  /** Whether the body stops movement and rays. Doors and corpses toggle this. */
  blocking: boolean;

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
    width = CELL_SIZE * 0.5,
    length = CELL_SIZE * 0.5,
    height = CELL_SIZE * 0.5,
    blocking = true,
  }: BodyOptions = {}) {
    super();

    this.id = generateId(this);
    this.pos = new Point(x, y);
    this.width = width;
    this.length = length;
    this.height = height;
    this.blocking = blocking;
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
