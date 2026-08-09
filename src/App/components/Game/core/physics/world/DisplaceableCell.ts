import { CELL_SIZE } from '@constants/config';
import { AXES } from '../constants';
import type { Axis } from '../constants';
import Point from '../geometry/Point';
import DynamicCell, { type DynamicCellOptions } from './DynamicCell';

/** How far the slab is left standing proud of its new cell once it stops. */
const BLOCKED_OFFSET = 0.1 * CELL_SIZE;

const EVENTS = {
  BLOCKED: 'cell:blocked',
};

/**
 * A cell whose surface translates as a solid slab, taking the whole wall with
 * it. Push walls are built from this.
 *
 * Nothing opens, so there is no gap test: the hit plane simply moves, and a ray
 * misses only once the slab has left the cell entirely. That is the whole
 * difference from {@link RetractableCell}.
 *
 * Once the slab has travelled a full cell it swaps places with the cell ahead
 * of it in the grid and carries on, until the next one will not take it. All of
 * that is geometry. What stopping *means* — a sound, a shake, a secret found —
 * is the game's, and it subscribes through {@link onBlocked}.
 */
export default class DisplaceableCell extends DynamicCell {
  /**
   * Which way the slab travels, in grid steps. Set by the game layer from
   * whichever side the push came from; mutate the components rather than
   * reassigning, as with {@link DynamicCell.velocity}.
   */
  readonly direction: Point;

  constructor(options: DynamicCellOptions) {
    super(options);

    this.direction = new Point(0, 0);
  }

  /** A push wall slides across its axis, not along it, unlike a door. */
  get slideAxis(): Axis {
    return this.axis === AXES.X ? AXES.Y : AXES.X;
  }

  /** Whether the cell ahead is somewhere this slab could stand. */
  canMove(): boolean {
    const x = this.gridX - this.direction.x;
    const y = this.gridY - this.direction.y;
    const nextCell = this.parent!.getCell(x, y)!;

    return nextCell.id !== this.id && !nextCell.blocking;
  }

  /**
   * Slides, then hands the grid over once a whole cell has been covered.
   *
   * Swapping with the cell ahead is bookkeeping the world needs done correctly,
   * not a game rule — the grid has to keep pointing at whatever now stands in
   * each square.
   */
  update(delta: number, elapsedMS?: number) {
    super.update(delta, elapsedMS);

    const axis = this.slideAxis;

    if (this.offset[axis] <= CELL_SIZE) {
      return;
    }

    this.takeNextCell();

    if (this.canMove()) {
      this.offset[axis] = 0;
    } else {
      this.offset[axis] = BLOCKED_OFFSET;
      this.velocity[axis] = 0;
      this.stopUpdates();
      this.emit(EVENTS.BLOCKED);
    }
  }

  /** Trades grid positions with the cell this slab has moved into. */
  private takeNextCell() {
    const { x, y } = this;
    const currentGridX = this.gridX;
    const currentGridY = this.gridY;
    const nextGridX = this.gridX - this.direction.x;
    const nextGridY = this.gridY - this.direction.y;
    const parent = this.parent!;
    const nextCell = parent.getCell(nextGridX, nextGridY)!;

    nextCell.x = x;
    nextCell.y = y;

    this.x = CELL_SIZE * nextGridX + CELL_SIZE / 2;
    this.y = CELL_SIZE * nextGridY + CELL_SIZE / 2;

    parent.setCell(currentGridX, currentGridY, nextCell);
    parent.setCell(nextGridX, nextGridY, this);
  }

  /** Stopped, because the cell beyond will not take it. */
  onBlocked(callback: () => void) {
    this.on(EVENTS.BLOCKED, callback);
  }
}
