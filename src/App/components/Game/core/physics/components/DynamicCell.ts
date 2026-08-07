import { CELL_SIZE } from '@constants/config';
import Cell, { type CellOptions } from './Cell';
import Point from './Point';
import type World from './World';

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

  /**
   * The world this cell belongs to, or null once removed.
   *
   * Declared here rather than on `Body`, and duplicated on `DynamicBody`,
   * because those two are the only things that ever hold one — a static cell
   * never looks outward — and they meet nowhere below `Body`. Same trade as
   * `setState`: one field in two places beats one field on a class that has no
   * use for it.
   */
  parent: World | null = null;

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
   *
   * Takes `_elapsedMS` without using it because `World.update` calls every
   * updatable body with both, and the union of the two branches only accepts
   * what they both declare. Subclasses in `engine/` do use it.
   */
  update(delta: number, _elapsedMS?: number) {
    this.offset.x += this.velocity.x * delta;
    this.offset.y += this.velocity.y * delta;
  }

  /**
   * Takes the world reference this class needs to do anything at all —
   * `startUpdates`, `stopUpdates` and every subclass that queries its
   * neighbours all read `parent`, and nothing else assigns it.
   *
   * A static `Cell` never gets one and never wants one: it does not look
   * outward. That is what makes this a `DynamicCell` concern rather than a
   * `Body` one.
   */
  onAdded(parent: World) {
    this.parent = parent;
  }

  /** Symmetric with `onAdded`, so a removed cell holds no stale world. */
  onRemoved() {
    this.parent = null;
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

    // The one back-reference up the graph, same as DynamicBody's.
    this.parent = null;
  }
}
