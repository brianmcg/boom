import Cell from './Cell';

export default class TransparentCell extends Cell {
  constructor({ transparency, ...other }) {
    super(other);
    this.transparency = transparency;
  }
}
