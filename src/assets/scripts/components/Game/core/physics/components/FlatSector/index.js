import Sector from '../Sector';

/**
 * Class representing a flat sector.
 */
class FlatSector extends Sector {
  /**
   * @param  {Number}  options.x         The x coordinate of the sector.
   * @param  {Number}  options.y         The y coordinate of the sector
   * @param  {Number}  options.width     The width of the sector.
   * @param  {Number}  options.length    The length of the sector.
   * @param  {Number}  options.height    The height of the sector.
   * @param  {Boolean} options.blocking  Is the sector blocking.
   * @param  {String}  options.axis      The axis of the sector.
   */
  constructor({ axis, ...other }) {
    super(other);
    this.axis = axis;
  }
}

export default FlatSector;
