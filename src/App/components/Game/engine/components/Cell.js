import { Cell as PhysicsCell } from '@game/core/physics';

export default class Cell extends PhysicsCell {
  constructor({ sides = {}, reverse, closed, edge, ...other }) {
    super(other);

    this.edge = edge;
    this.reverse = reverse;
    this.front = sides.front;
    this.left = sides.left;
    this.back = sides.back;
    this.right = sides.right;
    this.bottom = sides.bottom;
    this.top = sides.top;

    this.closed = closed;
  }
}
