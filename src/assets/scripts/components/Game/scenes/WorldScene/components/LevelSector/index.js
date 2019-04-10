import { Sector } from '~/core/physics';

export default class LevelSector extends Sector {
  /**
   * Creates a level sector
   * @param  {Number} options.x      The x coordinate of the sector.
   * @param  {Number} options.y      The y coordinate of the sector
   * @param  {Number} options.width  The width of the sector.
   * @param  {Number} options.length The length of the sector.
   * @param  {Number} options.height The height of the sector.
   * @param  {Array}  options.faces  The faces of the sector.
   */
  constructor({ faces = [], ...other }) {
    super(other);
    this.faces = faces;
  }
}
