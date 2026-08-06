import { CELL_SIZE } from '@constants/config';
import Cell, { type CellOptions } from './Cell';

export interface DynamicCellOptions extends CellOptions {
  /** How far the cell slides per frame, as a ratio of a cell. */
  speed: number;
  autoPlay?: boolean;
}

/**
 * A cell that slides open and shut — doors and push walls. Movement itself is
 * left to the game layer; this class only wires the cell into the world's
 * update loop.
 */
export default class DynamicCell extends Cell {
  /** Slide speed in world units per frame. */
  readonly speed: number;

  readonly isDynamic = true;

  readonly autoPlay: boolean;

  constructor({ speed, autoPlay = false, ...other }: DynamicCellOptions) {
    super(other);
    this.speed = speed * CELL_SIZE;
    this.autoPlay = autoPlay;
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
