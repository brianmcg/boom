import Entity from '../Entity';

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
   * @param  {Number} options.height  The height of the body.
   * @param  {String} options.texture The texture of entity.
   */
  constructor({ type, ...other }) {
    super({ blocking: false, ...other });

    this.isItem = true;
    this.type = type;

    if (this.constructor === AbstractItem) {
      throw new TypeError('Can not construct abstract class.');
    }
  }

  /**
   * Set to the removed state.
   * @return {Boolean} state change successful.
   */
  setRemoved() {
    this.isRemoved = true;
  }
}

export default AbstractItem;
