import FlatSector from '../FlatSector';

/**
 * Class representing a dynamic flat sector.
 */
class DynamicFlatSector extends FlatSector {
  /**
   * @param  {Number}  options.x         The x coordinate of the sector.
   * @param  {Number}  options.y         The y coordinate of the sector
   * @param  {Number}  options.width     The width of the sector.
   * @param  {Number}  options.length    The length of the sector.
   * @param  {Number}  options.height    The height of the sector.
   * @param  {Boolean} options.blocking  Is the sector blocking.
   * @param  {String}  options.axis      The axis of the sector.
   * @param  {Number}  options.speed     The speed of the sector.
   */
  constructor({ speed, ...other }) {
    super(other);
    this.speed = speed;
  }
}

export default DynamicFlatSector;
