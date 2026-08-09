import { CELL_SIZE } from '@constants/config';
import { AXES } from '../constants';
import Shape from '../geometry/Shape';
import DynamicCell, { type DynamicCellOptions } from './DynamicCell';

const HALF_CELL_SIZE = CELL_SIZE / 2;

const EVENTS = {
  RETRACTED: 'cell:retracted',
  RETURNED: 'cell:returned',
};

export interface RetractableCellOptions extends DynamicCellOptions {
  double?: boolean;
}

/**
 * A cell whose surface slides back within its own cell, leaving an opening.
 * Doors are built from this.
 *
 * A ray crossing the opened part passes through and keeps stepping; one
 * crossing the remaining leaf hits it. That is the whole difference from
 * {@link DisplaceableCell}, which translates its surface as a solid slab.
 *
 * The travel runs from `0` (shut) to `CELL_SIZE` (fully retracted) along the
 * cell's own `axis`, and this class stops itself at both ends. What reaching an
 * end *means* — a timer, a sound, the cell ceasing to block — is the game's,
 * and it subscribes through {@link onRetracted} and {@link onReturned}.
 */
export default class RetractableCell extends DynamicCell {
  /** Parts from the middle rather than one way, so both leaves move. */
  readonly double: boolean;

  constructor({ double = false, ...other }: RetractableCellOptions) {
    super(other);

    this.double = double;
  }

  /**
   * Slides, then stops at whichever end it reached.
   *
   * The limits are geometry: a surface cannot retract further than its own cell
   * or return past shut. Only the reaction to arriving is a game rule.
   */
  update(delta: number, elapsedMS?: number) {
    super.update(delta, elapsedMS);

    const { axis } = this;

    if (!axis) {
      return;
    }

    if (this.offset[axis] > CELL_SIZE) {
      this.offset[axis] = CELL_SIZE;
      this.emit(EVENTS.RETRACTED);
    } else if (this.offset[axis] < 0) {
      this.offset[axis] = 0;
      this.emit(EVENTS.RETURNED);
    }
  }

  /** Fully open. */
  onRetracted(callback: () => void) {
    this.on(EVENTS.RETRACTED, callback);
  }

  /** Fully shut. */
  onReturned(callback: () => void) {
    this.on(EVENTS.RETURNED, callback);
  }

  /**
   * A fully retracted cell no longer occupies the whole square, so it needs its
   * own box rather than `Body`'s. Anything short of fully retracted still
   * blocks the square it sits in, and falls back.
   *
   * Lived on `engine`'s `Door` until the class split, which is why it is
   * written in terms of `offset` and `reverse` rather than door states.
   */
  get shape(): Shape {
    if (this.offset.x === CELL_SIZE || this.offset.y === CELL_SIZE) {
      if (this.axis === AXES.Y) {
        const offsetX = this.reverse
          ? this.offset.x
          : CELL_SIZE - this.offset.x + this.width;

        return new Shape(
          this.x - HALF_CELL_SIZE + (CELL_SIZE - offsetX),
          this.y - HALF_CELL_SIZE + this.offset.y,
          this.width,
          this.length
        );
      }

      const offsetY = this.reverse
        ? this.offset.y
        : CELL_SIZE - this.offset.y + this.length;

      return new Shape(
        this.x - HALF_CELL_SIZE + this.offset.x,
        this.y - HALF_CELL_SIZE + (CELL_SIZE - offsetY),
        this.width,
        this.length
      );
    }

    return super.shape;
  }
}
