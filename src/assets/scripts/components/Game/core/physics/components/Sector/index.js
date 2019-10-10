import Body from '../Body';

/**
 * Creates a sector
 * @extends {Body}
 */
class Sector extends Body {
  /**
   * Creates a sector
   * @param  {Number} options.x       The x coordinate of the sector.
   * @param  {Number} options.y       The y coordinate of the sector
   * @param  {Number} options.width   The width of the sector.
   * @param  {Number} options.length  The length of the sector.
   * @param  {Number} options.height  The height of the sector.
   * @param  {Object} options.sides   The ids of the sides of the sector.
   */
  constructor(options) {
    super(options);
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

export default Sector;