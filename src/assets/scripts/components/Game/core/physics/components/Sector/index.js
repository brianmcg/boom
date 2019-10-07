import Body from '../Body';

const SIDES = {
  FRONT: 0,
  LEFT: 1,
  BACK: 2,
  RIGHT: 3,
  BOTTOM: 4,
  TOP: 5,
};

/**
 * Creates a sector
 * @extends {Body}
 */
class Sector extends Body {
  /**
   * Constant representing the sides of a sector.
   */
  static get SIDES() {
    return SIDES;
  }

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
    this.childIds = [];
    this.sideIds = sideIds;
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
