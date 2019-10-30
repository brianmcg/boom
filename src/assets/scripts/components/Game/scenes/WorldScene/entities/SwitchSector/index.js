import Sector from '../Sector';

/**
 * Class representing a switch sector.
 * @extends {Sector}
 */
class SwitchSector extends Sector {
  /**
   * Creates a switch sector
   * @param  {Number} options.x       The x coordinate of the sector.
   * @param  {Number} options.y       The y coordinate of the sector
   * @param  {Number} options.width   The width of the sector.
   * @param  {Number} options.length  The length of the sector.
   * @param  {Number} options.height  The height of the sector.
   * @param  {Object} options.sides   The ids of the sides of the sector.
   */
  constructor(options) {
    super(options);
    this.enabled = false;
  }

  /**
   * Use the switch.
   */
  use() {
    this.enabled = !this.enabled;
  }
}

export default SwitchSector;
