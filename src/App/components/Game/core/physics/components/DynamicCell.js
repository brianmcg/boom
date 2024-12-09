import { CELL_SIZE } from '@constants/config';
import Cell from './Cell';

export default class DynamicCell extends Cell {
  constructor({ speed, autoPlay = false, ...other }) {
    super(other);
    this.speed = speed * CELL_SIZE;
    this.isDynamic = true;
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

  destroy(options) {
    this.stopUpdates();
    super.destroy(options);
  }
}
