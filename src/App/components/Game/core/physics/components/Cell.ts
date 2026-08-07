import { CELL_SIZE } from '@constants/config';
import { AXES, TRANSPARENCY } from '../constants';
import type { Axis, Transparency } from '../constants';
import type { Side, Sides } from '../types';
import Point from './Point';
import Body, { type BodyOptions } from './Body';

export interface CellOptions extends BodyOptions {
  axis?: Axis;
  /** The texture drawn on each face. Faces the map data omits stay undefined. */
  sides?: Sides;
  /**
   * How far open the cell starts, as a ratio of a cell. Stored as world units
   * on {@link Cell.offset} — the input and the stored value are different units.
   */
  offset?: number;
  transparency?: Transparency;
  isDoor?: boolean;
  isPushWall?: boolean;
  double?: boolean;
  reverse?: boolean;
  closed?: boolean;
  edge?: boolean;
}

/**
 * One square of the world grid.
 *
 * A cell is a `Body` that never moves and that owns the bodies standing on it.
 * Everything below the `add`/`remove` pair is the contract the raycaster in
 * `utils/castRay.ts` reads; subclasses in the game layer configure those fields
 * rather than inventing their own.
 */
export default class Cell extends Body {
  /** The bodies currently standing on this cell. */
  bodies: Body[];

  /**
   * Which way a sliding cell is aligned. Falsy on a plain cell, which the
   * raycaster reads as a solid, immovable wall.
   */
  axis?: Axis;

  /** How far the cell has slid open, in world units, per axis. */
  offset: Point;

  /**
   * The contract the raycaster reads. Subclasses configure it by passing these
   * through `super()` rather than assigning them afterwards — that is the house
   * style for options, not a restriction. Nothing currently changes them once a
   * cell is built, but nothing stops you: a wall that turns transparent
   * mid-level is a feature, not a violation.
   */

  /** Whether rays pass through this cell into the next wall layer. */
  transparency: Transparency;

  isDoor: boolean;
  isPushWall: boolean;

  /** A door that opens from the middle outwards rather than sliding one way. */
  double: boolean;

  /** Inverts which side of the cell the offset is applied from. */
  reverse: boolean;

  /** Renderer hint: this cell has no open face, so nothing behind it is drawn. */
  closed: boolean;

  /** Renderer hint: this cell sits on the edge of the map. */
  edge: boolean;

  /**
   * The texture drawn on each face, spread onto the cell so the raycaster can
   * read a face by name. Undefined where the map data defined no face; the
   * raycaster passes that through verbatim, which is how {@link Ray.side} ends
   * up `Side | undefined`.
   */
  front?: Side;
  left?: Side;
  back?: Side;
  right?: Side;

  /** Read by the renderer, not the raycaster: the ceiling and floor behind. */
  top?: Side;
  bottom?: Side;

  /** A second surface drawn in front of the cell's own face, e.g. a door frame. */
  overlay?: Side;

  constructor({
    axis,
    offset = 0,
    sides = {},
    transparency = TRANSPARENCY.NONE,
    isDoor = false,
    isPushWall = false,
    double = false,
    reverse = false,
    closed = false,
    edge = false,
    ...other
  }: CellOptions) {
    super(other);

    this.bodies = [];
    this.axis = axis;
    this.offset = new Point(0, 0);

    this.front = sides.front;
    this.left = sides.left;
    this.back = sides.back;
    this.right = sides.right;
    this.top = sides.top;
    this.bottom = sides.bottom;
    this.overlay = sides.overlay;

    this.transparency = transparency;
    this.isDoor = isDoor;
    this.isPushWall = isPushWall;
    this.double = double;
    this.reverse = reverse;
    this.closed = closed;
    this.edge = edge;

    if (this.isHorizontal()) {
      this.offset.y = CELL_SIZE * offset;
    }

    if (this.isVertical()) {
      this.offset.x = CELL_SIZE * offset;
    }
  }

  add(body: Body) {
    if (body !== this && !this.bodies.includes(body)) {
      this.bodies.push(body);
    }
  }

  remove(body: Body) {
    this.bodies = this.bodies.filter(b => b.id !== body.id);
  }

  isHorizontal(): boolean {
    return this.axis === AXES.X;
  }

  isVertical(): boolean {
    return this.axis === AXES.Y;
  }

  destroy(options?: unknown) {
    super.destroy(options);

    this.bodies = [];
  }
}
