import Cell from '../Cell';

class TransparentCell extends Cell {
  constructor({ transparency, ...other }) {
    super(other);
    this.transparency = transparency;
  }
}

export default TransparentCell;
