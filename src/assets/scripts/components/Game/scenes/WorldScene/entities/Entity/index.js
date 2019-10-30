import { Body } from '~/core/physics';

/**
 * Class representing an entity.
 * @extends {Body}
 */
class Entity extends Body {
  /**
   * Creates an entity.
   * @param  {Number} options.x      The x coordinate of the body.
   * @param  {Number} options.y      The y coordinate of the body
   * @param  {Number} options.width  The width of the body.
   * @param  {Number} options.length The length of the body.
   * @param  {Number} options.height The height of the body.
   * @param  {String} options.type   The type of entity.
   */
  constructor({ type, ...other }) {
    super(other);
    this.type = type;
  }
}

export default Entity;
