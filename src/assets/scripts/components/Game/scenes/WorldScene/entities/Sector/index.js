import { Sector as PhysicsSector } from 'game/core/physics';

/**
 * Class representing a game sector.
 * @extends {Sector}
 */
class Sector extends PhysicsSector {
  /**
   * Creates a sector.
   * @param  {Number} options.x       The x coordinate of the sector.
   * @param  {Number} options.y       The y coordinate of the sector
   * @param  {Number} options.width   The width of the sector.
   * @param  {Number} options.length  The length of the sector.
   * @param  {Number} options.height  The height of the sector.
   * @param  {Object} options.sides   The ids of the sides of the sector.
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

export default Sector;
