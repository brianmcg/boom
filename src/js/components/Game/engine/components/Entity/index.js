import { Body } from '@game/core/physics';

/**
 * Class representing an entity.
 * @extends {Body}
 */
class Entity extends Body {
  /**
   * Creates an entity.
   * @param  {Number}  options.x        The x coordinate of the entity.
   * @param  {Number}  options.y        The y coordinate of the entity.
   * @param  {Number}  options.z        The z coordinate of the entity.
   * @param  {Number}  options.width    The width of the entity.
   * @param  {Number}  options.height   The length of the entity.
   * @param  {Number}  options.height   The height of the entity.
   * @param  {Boolean} options.blocking The blocking value of the entity.
   * @param  {Number}  options.anchor   The anchor of the entity.
   * @param  {Boolean} options.animated Is the entity animated.
   * @param  {Boolean} options.scale    The scale of the entity.
   * @param  {String}  options.name     The name of entity.
   */
  constructor({ name, animated = false, scale = 1, alwaysRender, ...other }) {
    super(other);

    this.name = name;
    this.animated = animated;
    this.scale = scale;
    this.alwaysRender = alwaysRender;
  }
}

export default Entity;
