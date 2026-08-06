import { CELL_SIZE } from '@constants/config';
import { AXES, TRANSPARENCY } from '../constants';
import type { Axis, Transparency } from '../constants';
import type { Side } from '../types';
import Point from './Point';
import Body, { type BodyOptions } from './Body';

export interface CellOptions extends BodyOptions {
  axis?: Axis;
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
 * `helpers.ts` reads; subclasses in the game layer configure those fields
 * rather than inventing their own.
 */
export default class Cell extends Body {
  /** The bodies currently standing on this cell. */
  bodies: Body[];

  /**
   * Which way a sliding cell is aligned. Falsy on a plain cell, which the
   * raycaster reads as a solid, immovable wall.
   */
  axis?: Axis | null;

  /** How far the cell has slid open, in world units, per axis. */
  offset: Point;

  /**
   * Everything below is fixed when the cell is built and never changes
   * afterwards, so subclasses pass these through `super()` rather than
   * assigning them — a `readonly` declared here cannot be written from a
   * subclass constructor.
   */

  /** Whether rays pass through this cell into the next wall layer. */
  readonly transparency: Transparency;

  readonly isDoor: boolean;
  readonly isPushWall: boolean;

  /** A door that opens from the middle outwards rather than sliding one way. */
  readonly double: boolean;

  /** Inverts which side of the cell the offset is applied from. */
  readonly reverse: boolean;

  /** Renderer hint: this cell has no open face, so nothing behind it is drawn. */
  readonly closed: boolean;

  /** Renderer hint: this cell sits on the edge of the map. */
  readonly edge: boolean;

  /**
   * The texture drawn on each face. Left to the game layer to populate, and
   * `declare`d so this class contributes no runtime property of its own — the
   * raycaster passes these values through verbatim and distinguishes "absent"
   * from "present".
   */
  declare front?: Side;
  declare left?: Side;
  declare back?: Side;
  declare right?: Side;
  declare top?: Side;
  declare bottom?: Side;

  /** A second surface drawn in front of the cell's own face, e.g. a door frame. */
  declare overlay?: Side;

  constructor({
    axis,
    offset = 0,
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

  destroy(_options?: unknown) {
    this.bodies = [];
    this.axis = null;
    this.offset = new Point(0, 0);
  }
}
