import { TRANSPARENCY } from '../constants';
import type { Transparency } from '../constants';
import Cell, { type CellOptions } from './Cell';

export interface TransparentCellOptions extends CellOptions {
  transparency?: Transparency;
}

/**
 * A cell rays pass through into the next wall layer — a grate, a window.
 *
 * It does not move, so it sits beside `DynamicCell` rather than under it. It
 * may still carry an `offset`: that is where its surface sits within the cell,
 * not how far it has travelled.
 *
 * Being transparent is the class, not a field, so `castRay` and `DynamicBody`
 * ask `instanceof` and a cell that is not one has no answer to give. How
 * transparent it is *is* a field, because `PARTIAL` and `FULL` differ in degree
 * rather than in kind.
 */
export default class TransparentCell extends Cell {
  /** Whether rays pass through this cell into the next wall layer. */
  transparency: Transparency;

  constructor({
    transparency = TRANSPARENCY.PARTIAL,
    ...other
  }: TransparentCellOptions) {
    super(other);

    this.transparency = transparency;
  }
}
