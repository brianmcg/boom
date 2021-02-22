import { CELL_SIZE } from 'game/constants/config';
import Body from '../Body';

const AXES = {
  X: 'x',
  Y: 'y',
};

/**
 * Creates a cell
 * @extends {Body}
 */
class Cell extends Body {
  /**
   * Creates a cell
   * @param  {Number}  options.x         The x coordinate of the cell.
   * @param  {Number}  options.y         The y coordinate of the cell
   * @param  {Number}  options.width     The width of the cell.
   * @param  {Number}  options.height    The height of the cell.
   * @param  {Boolean} options.blocking  Is the cell blocking.
   */
  constructor({ axis, ...other }) {
    super(other);
    this.bodies = [];
    this.axis = axis;
    this.offset = axis ? { x: 0, y: 0 } : null;

    if (this.isHorizontal()) {
      this.offset.y = CELL_SIZE / 2;
    }

    if (this.isVertical()) {
      this.offset.x = CELL_SIZE / 2;
    }
  }

  /**
   * Add a body.
   * @param {Body} body The body to add.
   */
  add(body) {
    this.bodies.push(body);
  }

  /**
   * Remove a body.
   * @param  {Body} body The body to remove.
   */
  remove(body) {
    this.bodies = this.bodies.filter(b => b.id !== body.id);
  }

  /**
   * Is the axis horizontal.
   * @return  {Boolean}
   */
  isHorizontal() {
    return this.axis === AXES.X;
  }

  /**
   * Is the axis vertical.
   * @return  {Boolean}
   */
  isVertical() {
    return this.axis === AXES.Y;
  }
}

export default Cell;
