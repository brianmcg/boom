import { CELL_SIZE } from '@constants/config';
import { AXES } from '../constants';
import Body from './Body';

/**
 * Creates a cell
 * @extends {Body}
 */
export default class Cell extends Body {
  /**
   * Creates a cell
   * @param  {Number}  options.x        The x coordinate of the cell.
   * @param  {Number}  options.y        The y coordinate of the cell.
   * @param  {Number}  options.z        The z coordinate of the cell.
   * @param  {Number}  options.width    The width of the cell.
   * @param  {Number}  options.height   The length of the cell.
   * @param  {Number}  options.height   The height of the cell.
   * @param  {Boolean} options.blocking The blocking value of the cell.
   * @param  {Number}  options.anchor   The anchor of the cell.
   * @param  {String}  options.axis     The anchor of the cell.
   * @param  {Number}  options.offset   The offset of the cell.
   */
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
