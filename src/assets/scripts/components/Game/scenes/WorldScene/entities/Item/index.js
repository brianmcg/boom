import Entity from '../Entity';

const TYPES = {
  AMMO: 'ammo',
  HEALTH: 'health',
  KEY: 'key',
  WEAPON: 'weapon',
};

const STATES = {
  IDLE: 'item:idle',
  COLLIDING: 'item:colliding',
  REMOVED: 'item:removed',
};

/**
 * Class representing an item.
 * @extends {Entity}
 */
class Item extends Entity {
  /**
   * Creates an item.
   * @param  {Number} options.x       The x coordinate of the body.
   * @param  {Number} options.y       The y coordinate of the body
   * @param  {Number} options.width   The width of the body.
   * @param  {Number} options.length  The length of the body.
   * @param  {Number} options.height  The height of the body.
   * @param  {String} options.texture The texture of entity.
   */
  constructor({ key, value, ...other }) {
    super({ blocking: false, ...other });
    this.setIdle();
  }

  /**
   * Set to the idle state.
   * @return {Boolean} state change successful.
   */
  setIdle() {
    return this.setState(STATES.IDLE);
  }

  /**
   * Set to the colliding state.
   * @return {Boolean} state change successful.
   */
  setColliding() {
    return this.setState(STATES.COLLIDING);
  }

  /**
   * Set to the removed state.
   * @return {Boolean} state change successful.
   */
  setRemoved() {
    return this.setState(STATES.REMOVED);
  }

  /**
   * Is the item in the idle state.
   * @return {Boolean}
   */
  isIdle() {
    return this.state === STATES.IDLE;
  }

  /**
   * Is the item in the colliding state.
   * @return {Boolean}
   */
  isColliding() {
    return this.state === STATES.COLLIDING;
  }

  /**
   * Is the item in the removed state.
   * @return {Boolean}
   */
  isRemoved() {
    return this.state === STATES.REMOVED;
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
