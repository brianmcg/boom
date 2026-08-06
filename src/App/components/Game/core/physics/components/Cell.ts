import { CELL_SIZE } from '@constants/config';
import { AXES, TRANSPARENCY } from '../constants';
import type { Axis, Transparency } from '../constants';
import type { Point, Side } from '../types';
import Body, { type BodyOptions } from './Body';

export interface CellOptions extends BodyOptions {
  axis?: Axis;
  /**
   * How far open the cell starts, as a ratio of a cell. Stored as world units
   * on {@link Cell.offset} — the input and the stored value are different units.
   */
  offset?: number;
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

  /** Whether rays pass through this cell into the next wall layer. */
  transparency: Transparency = TRANSPARENCY.NONE;

  isDoor = false;
  isPushWall = false;

  /** A door that opens from the middle outwards rather than sliding one way. */
  double = false;

  /** Inverts which side of the cell the offset is applied from. */
  reverse = false;

  /** Renderer hint: this cell has no open face, so nothing behind it is drawn. */
  closed = false;

  /** Renderer hint: this cell sits on the edge of the map. */
  edge = false;

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

  constructor({ axis, offset = 0, ...other }: CellOptions) {
    super(other);

    this.bodies = [];
    this.axis = axis;
    this.offset = { x: 0, y: 0 };

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
    this.offset = {} as Point;
  }
}
