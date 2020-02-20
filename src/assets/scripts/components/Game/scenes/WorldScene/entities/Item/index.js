import Entity from '../Entity';

const TYPES = {
  AMMO: 'ammo',
  HEALTH: 'health',
  KEY: 'key',
  WEAPON: 'weapon',
};

/**
 * Class representing an item.
 * @extends {Entity}
 */
class Item extends Entity {
  /**
   * Creates an item.
   * @param  {Number} options.x      The x coordinate of the body.
   * @param  {Number} options.y      The y coordinate of the body
   * @param  {Number} options.width  The width of the body.
   * @param  {Number} options.length The length of the body.
   * @param  {Number} options.height The height of the body.
   * @param  {String} options.type   The type of entity.
   */
  constructor({ key, value, ...other }) {
    super({ blocking: false, ...other });
    this.found = false;
  }

  setFound() {
    this.found = true;
  }

  /**
   * The item types.
   * @static
   */
  static get TYPES() {
    return TYPES;
  }
}

export default Item;
