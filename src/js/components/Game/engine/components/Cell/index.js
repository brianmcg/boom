import { Cell as PhysicsCell } from 'game/core/physics';

/**
 * Class representing a game cell.
 * @extends {Cell}
 */
class Cell extends PhysicsCell {
  /**
   * Creates a cell.
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
   * @param  {Object}  options.sides    The ids of the sides of the cell.
   * @param  {Boolean} options.reverse  Reverse the offset.
   * @param  {Boolean} options.closed   Close the top of the cell.
   * @param  {Boolean} options.edge     The edge cell option.
   */
  constructor({
    sides = {},
    reverse,
    closed,
    edge,
    ...other
  }) {
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

export default Cell;
