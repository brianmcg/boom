import { CELL_SIZE } from '@constants/config';
import Body, { type BodyOptions } from './Body';
import { TRANSPARENCY } from '../constants';
import type { Positioned } from '../types';
import { DEG_90, DEG_270, DEG_360 } from '../utils/degrees';
import Point from './Point';
import { getAngleBetween } from '../utils/measure';
import type Ray from './Ray';
import type Cell from './Cell';
import type World from './World';
import { isLineBodyIntersection } from '../utils/intersections';
import { castRay } from '../utils/castRay';

const EVENTS = {
  COLLISION_START: 'body:collision:start',
  COLLISION_END: 'body:collision:end',
};

const VELOCITY_LIMIT = CELL_SIZE / 2;

const { FULL } = TRANSPARENCY;

/** Any `Body` subclass, including abstract ones, usable as an `instanceof` test. */
export type BodyConstructor = abstract new (...args: never[]) => Body;

/**
 * A subscription to collisions with one kind of body. `onStart` fires the frame
 * a collision begins, `onComplete` the frame it ends.
 */
export interface TrackedCollision {
  type: BodyConstructor;
  onStart?: (body: Body) => void;
  onComplete?: (body: Body) => void;
}

export interface DynamicBodyOptions extends BodyOptions {
  angle?: number;
  /** A weightless body passes through transparent cells. */
  weight?: number;
  autoPlay?: boolean;
}

/**
 * A body that moves. Each update it steps along its own angle, resolves
 * collisions against the bodies in the surrounding cells one axis at a time,
 * and re-registers itself with whichever cell it ended up in.
 */
export default class DynamicBody extends Body {
  /** How fast the body moves, in world units per frame. */
  velocity: number;

  /**
   * Which way the body faces, in radians. **Callers must keep it within
   * `[0, 2π)`** — the raycaster picks a quadrant by comparing against `DEG_90`,
   * `DEG_180` and `DEG_270`, and an angle that has drifted outside the range
   * takes the wrong branch: `6.3879` fails `angle < DEG_180` while the
   * identical direction `0.1047` passes, so the ray steps toward `-y` instead
   * of `+y`.
   *
   * Every writer in `engine/` does this, either explicitly as
   * `(x + DEG_360) % DEG_360` or by taking the value from `getAngleBetween`,
   * which normalises internally.
   *
   * A normalising setter lived here for three commits and was removed on
   * purpose: an invariant this widely shared belongs in an `Angle` value type
   * that carries it everywhere the number goes, including through the raw
   * arithmetic `engine/` does on it. That type needs `engine/` to be
   * TypeScript first — until then a setter would guard only assignment to this
   * one field, which is not where the invariant lives.
   *
   * If you write the normalisation by hand, wrap the way `getAngleBetween`
   * does. Not `((v % DEG_360) + DEG_360) % DEG_360`: adding 2π to an angle
   * already in range and taking the modulus back loses a few bits, so that
   * form silently perturbs every angle it touches.
   */
  angle: number;

  readonly isDynamic = true;

  /** A weightless body passes through transparent cells. */
  weight: number;

  autoPlay: boolean;

  /** How many cells out to gather potential collisions from. Fixed by width. */
  readonly collisionRadius: number;

  /** The cell this body currently stands on, or null while unparented. */
  cell: Cell | null = null;

  /**
   * Where the body was before the current update, used to work out which side
   * of a blocking body it hit.
   *
   * @internal Public only because the collision helpers live in another module.
   */
  previousPos: Point;

  /** Bodies collided with during the last update. */
  private collisions: Body[];

  private trackedCollisions: TrackedCollision[];

  constructor({
    angle = 0,
    weight = 1,
    autoPlay = true,
    ...other
  }: DynamicBodyOptions = {}) {
    super(other);

    this.velocity = 0;
    this.angle = angle;
    this.weight = weight;
    this.collisions = [];
    this.trackedCollisions = [];
    this.autoPlay = autoPlay;
    this.previousPos = new Point(0, 0);
    this.collisionRadius = Math.ceil(this.width / CELL_SIZE);
  }

  onAdded(parent: World) {
    this.parent = parent;
    this.cell = parent.getCell(this.gridX, this.gridY);
  }

  /** Also refreshes the cached cell, which `update` otherwise maintains. */
  reindex(previousGridX: number, previousGridY: number) {
    super.reindex(previousGridX, previousGridY);

    if (this.parent) {
      this.cell = this.parent.getCell(this.gridX, this.gridY);
    }
  }

  onRemoved() {
    this.parent = null;
    this.cell = null;
  }

  onCollisionStart(callback: (body: Body) => void) {
    this.on(EVENTS.COLLISION_START, callback);
  }

  onCollisionEnd(callback: (body: Body) => void) {
    this.on(EVENTS.COLLISION_END, callback);
  }

  isBodyCollision(body: Body): boolean {
    // A weightless body passes through anything rays can see through.
    if (!this.weight && body.transparency) {
      return false;
    }

    if (this.shape.overlaps(body.shape)) {
      return true;
    }

    // Overlapping where it stands is the common case; this catches a body that
    // moved far enough in one frame to pass clean through the other.
    return isLineBodyIntersection(body, {
      startPoint: this.previousPos,
      endPoint: new Point(this.x, this.y),
    });
  }

  update(delta: number) {
    // Get bodies from surrounding cells
    const bodies = this.parent!.getNeighbourBodies(this, this.collisionRadius);

    const collisions: Body[] = [];

    const velocity = Math.min(this.velocity * delta, VELOCITY_LIMIT);

    const halfWidth = this.width / 2;
    const halfLength = this.length / 2;

    this.previousPos.x = this.x;
    this.previousPos.y = this.y;

    // Unmark id from cell before moving
    this.cell!.remove(this);

    // Update x coordinate
    this.x += Math.cos(this.angle) * velocity;

    // Check for x axis collisions
    bodies.forEach(body => {
      if (this.isBodyCollision(body)) {
        if (this.isCollisionTracked(body)) {
          collisions.push(body);
        }

        if (body.blocking && body.transparency !== FULL) {
          const { shape } = body;
          const { x, width } = shape;

          if (this.previousPos.x < shape.x) {
            this.x = x - halfWidth - 0.0001;
          } else {
            this.x = x + width + halfWidth;
          }
        }
      }
    });

    // Update y coordinate
    this.y += Math.sin(this.angle) * velocity;

    // Check for y axis collisions
    bodies.forEach(body => {
      if (this.isBodyCollision(body)) {
        if (this.isCollisionTracked(body) && !collisions.includes(body)) {
          collisions.push(body);
        }

        if (body.blocking && body.transparency !== FULL) {
          const { shape } = body;
          const { y, length } = shape;

          if (this.previousPos.y < shape.y) {
            this.y = y - halfLength - 0.0001;
          } else {
            this.y = y + length + halfLength;
          }
        }
      }
    });

    this.trackedCollisions.forEach(({ type, onStart, onComplete }) => {
      if (onStart) {
        collisions.forEach(c => {
          if (c instanceof type && !this.collisions.includes(c)) {
            onStart(c);
          }
        });
      }

      if (onComplete) {
        this.collisions.forEach(c => {
          if (c instanceof type && !collisions.includes(c)) {
            onComplete(c);
          }
        });
      }
    });

    this.collisions = collisions;

    // Mark current cell with id
    this.cell = this.parent!.getCell(this.gridX, this.gridY);
    this.cell!.add(this);
  }

  /** Casts along the body's own angle unless one is given. Returns the last layer hit. */
  castRay(rayAngle?: number): Ray {
    const rays = castRay({
      x: this.x,
      y: this.y,
      angle: rayAngle === undefined ? this.angle : rayAngle,
      world: this.parent!,
    });

    return rays[rays.length - 1];
  }

  startUpdates() {
    if (this.parent) {
      this.parent.startUpdates(this);
    }
  }

  stopUpdates() {
    if (this.parent) {
      this.parent.stopUpdates(this);
    }
  }

  /**
   * The direction this body considers itself to be looking, which is not
   * always the direction it is moving. The player faces where its camera
   * points, so `Player` overrides this with its view angle.
   */
  get facingAngle(): number {
    return this.angle;
  }

  /** Whether `target` lies within the half-turn this body is facing. */
  isFacing(target: Positioned): boolean {
    const angle =
      (getAngleBetween(this, target) - this.facingAngle + DEG_360) % DEG_360;

    return angle > DEG_270 || angle < DEG_90;
  }

  addTrackedCollision(options: TrackedCollision) {
    this.trackedCollisions.push(options);
  }

  isCollisionTracked(body: Body): boolean {
    return this.trackedCollisions.some(c => body instanceof c.type);
  }

  getAngleTo(body: Positioned): number {
    return getAngleBetween(this, body);
  }

  destroy(options?: unknown) {
    super.destroy(options);

    // Only the back-references up the graph. Everything else this body holds
    // dies with it — see the note on destroy() in CLAUDE.md.
    this.cell = null;
  }
}
