import { CELL_SIZE } from 'game/constants/config';
import { AXES } from '../../constants';
import Body from '../Body';

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
  constructor({ axis, offset = 0.5, ...other }) {
    super(other);
    this.bodies = [];
    this.axis = axis;
    this.offset = axis ? { x: 0, y: 0 } : null;

    if (this.isHorizontal()) {
      this.offset.y = CELL_SIZE * offset;
    }

    if (this.isVertical()) {
      this.offset.x = CELL_SIZE * offset;
    }
  }

  /**
   * Add a body.
   * @param {Body} body The body to add.
   */
  add(body) {
    if (body !== this && !this.bodies.includes(body)) {
      this.bodies.push(body);
    }
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
