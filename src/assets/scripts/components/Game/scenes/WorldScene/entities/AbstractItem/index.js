import Entity from '../Entity';

const STATES = {
  IDLE: 'item:idle',
  COLLIDING: 'item:colliding',
  REMOVED: 'item:removed',
};

/**
 * Class representing an item.
 * @extends {Entity}
 */
class AbstractItem extends Entity {
  /**
   * Creates an item.
   * @param  {Number} options.x       The x coordinate of the body.
   * @param  {Number} options.y       The y coordinate of the body
   * @param  {Number} options.width   The width of the body.
   * @param  {Number} options.length  The length of the body.
   * @param  {Number} options.height  The height of the body.
   * @param  {String} options.texture The texture of entity.
   */
  constructor({ itemType, ...other }) {
    super({ blocking: false, ...other });

    this.setIdle();

    this.isItem = true;
    this.itemType = itemType;

    if (this.constructor === AbstractItem) {
      throw new TypeError('Can not construct abstract class.');
    }
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
}

export default AbstractItem;
