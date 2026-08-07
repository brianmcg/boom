import { CELL_SIZE } from '@constants/config';
import Cell, { type CellOptions } from './Cell';
import Point from './Point';

export interface DynamicCellOptions extends CellOptions {
  /** How far the cell slides per frame, as a ratio of a cell. */
  speed: number;
  autoPlay?: boolean;
}

/**
 * A cell that slides open and shut — doors and push walls.
 *
 * It moves the way a `DynamicBody` does: `speed` is the cap, `velocity` is the
 * rate currently applied, and `update` advances `offset` by it. What the
 * movement *means* — when to start, where to stop, what happens on arrival —
 * is the game layer's, and `Door`/`PushWall` drive it by setting `velocity`.
 */
export default class DynamicCell extends Cell {
  /** Slide speed in world units per frame. The cap, not the current rate. */
  readonly speed: number;

  /**
   * How fast the cell is currently sliding, per axis, in world units per
   * frame. Zero means stationary — a closed door and an opened one differ only
   * in their offset.
   *
   * A `Point` rather than a scalar because the two subclasses slide on
   * different axes: a door along its own `axis`, a push wall along the other
   * one. Negative closes.
   *
   * `readonly` for the same reason as `Body.pos`: mutate the components, never
   * reassign, so nothing can end up sharing one.
   */
  readonly velocity: Point;

  readonly isDynamic = true;

  autoPlay: boolean;

  constructor({ speed, autoPlay = false, ...other }: DynamicCellOptions) {
    super(other);
    this.speed = speed * CELL_SIZE;
    this.velocity = new Point(0, 0);
    this.autoPlay = autoPlay;
  }

  /**
   * Slides by the current velocity. Deliberately does not clamp or react to
   * reaching a limit — a door stopping at `CELL_SIZE` and a push wall swapping
   * grid cells are game rules, and they live in the subclasses.
   */
  update(delta: number) {
    this.offset.x += this.velocity.x * delta;
    this.offset.y += this.velocity.y * delta;
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

  destroy(options?: unknown) {
    this.stopUpdates();
    super.destroy(options);
  }
}
