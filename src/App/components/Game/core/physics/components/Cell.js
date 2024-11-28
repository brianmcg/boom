import { CELL_SIZE } from '@constants/config';
import { AXES } from '../constants';
import Body from './Body';

export default class Cell extends Body {
  constructor({ axis, offset = 0, ...other }) {
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

  add(body) {
    if (body !== this && !this.bodies.includes(body)) {
      this.bodies.push(body);
    }
  }

  remove(body) {
    this.bodies = this.bodies.filter(b => b.id !== body.id);
  }

  isHorizontal() {
    return this.axis === AXES.X;
  }

  isVertical() {
    return this.axis === AXES.Y;
  }
}
