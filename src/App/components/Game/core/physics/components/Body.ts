import { EventEmitter } from '@game/core/graphics';
import { CELL_SIZE } from '@constants/config';
import type { Transparency } from '../constants';
import type { Line, Positioned, RayCollision, Shape } from '../types';
import type World from './World';
import { getDistanceBetween } from './Point';
import { isRayCollision, getRayCollision } from '../helpers';

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

  x: number;
  y: number;
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

  /** Subclass-defined state machine label. Always set via {@link setState}. */
  state?: string;

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
    this.x = x;
    this.y = y;
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
  reindex(previousGridX: number, previousGridY: number) {
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

  isRayCollision(ray: Line): boolean {
    return isRayCollision(this, ray);
  }

  getRayCollision(ray: Line): RayCollision | null {
    return getRayCollision(this, ray);
  }

  /** Accepts any point, not just a body — callers pass bare grid coordinates. */
  getDistanceTo(body: Positioned): number {
    return getDistanceBetween(this, body);
  }

  /** Returns true only when the state actually changed. */
  setState(state: string): boolean {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
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

  get shape(): Shape {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.length / 2,
      width: this.width,
      length: this.length,
    };
  }
}

// Declared separately: a class merged with an interface cannot be exported
// inline as the default.
export default Body;
