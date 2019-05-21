import DynamicBody from '../DynamicBody';

/**
 * Creates a dynamic sector
 * @extends {DynamicBody}
 */
class DynamicSector extends DynamicBody {
  /**
   * Creates a sector
   * @param  {Number} options.x       The x coordinate of the sector.
   * @param  {Number} options.y       The y coordinate of the sector
   * @param  {Number} options.width   The width of the sector.
   * @param  {Number} options.length  The length of the sector.
   * @param  {Number} options.height  The height of the sector.
   * @param  {Array}  options.sideIds The ids of the sides of the sector.
   */
  constructor({ sideIds = [], ...other }) {
    super(other);
    this.sideIds = sideIds;
    this.childIds = [];
  }

  /**
   * Add a body id to the child list.
   * @param {String} id The id to add.
   */
  addChildId(id) {
    this.childIds.push(id);
  }

  /**
   * Remove a body id from the child list.
   * @param  {String} id The id to remove.
   */
  removeChildId(id) {
    this.childIds = this.childIds.filter(childId => childId !== id);
  }
}

export default DynamicSector;
