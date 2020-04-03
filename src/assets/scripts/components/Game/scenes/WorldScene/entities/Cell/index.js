import { Cell as PhysicsCell } from 'game/core/physics';

/**
 * Class representing a game cell.
 * @extends {Cell}
 */
class Cell extends PhysicsCell {
  /**
   * Creates a cell.
   * @param  {Number} options.x       The x coordinate of the cell.
   * @param  {Number} options.y       The y coordinate of the cell
   * @param  {Number} options.width   The width of the cell.
   * @param  {Number} options.height  The height of the cell.
   * @param  {Object} options.sides   The ids of the sides of the cell.
   */
  constructor({ sides = {}, ...other }) {
    super(other);

    this.front = sides.front;
    this.left = sides.left;
    this.back = sides.back;
    this.right = sides.right;
    this.bottom = sides.bottom;
    this.top = sides.top;
  }
}

export default Cell;
