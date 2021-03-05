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
   * @param  {Number}  options.height   The height of the entity.
   * @param  {Boolean} options.blocking Is the entity blocking.
   * @param  {Boolean} options.animated Is the entity animated.
   * @param  {String}  options.name     The name of entity.
   */
  constructor({ name, animated = false, ...other }) {
    super(other);
    this.name = name;
    this.animated = animated;
  }
}

export default Entity;
