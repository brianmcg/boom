import { Body } from 'game/core/physics';

/**
 * Class representing an entity.
 * @extends {Body}
 */
class Entity extends Body {
  /**
   * Creates an entity.
   * @param  {Number}  options.x        The x coordinate of the entity.
   * @param  {Number}  options.y        The y coordinate of the entity.
   * @param  {Number}  options.width    The width of the entity.
   * @param  {Number}  options.length   The length of the entity.
   * @param  {Number}  options.height   The height of the entity.
   * @param  {Boolean} options.blocking Is the entity blocking.
   * @param  {Boolean} options.animated Is the entity animated.
   * @param  {String}  options.type     The type of entity.
   */
  constructor({ type, animated, ...other }) {
    super(other);
    this.type = type;
    this.animated = animated;
  }
}

export default Entity;
