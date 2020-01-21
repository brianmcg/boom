import { DynamicBody } from 'game/core/physics';

/**
 * Class representing a dynamic entity.
 * @extends {DynamicBody}
 */
class DynamicEntity extends DynamicBody {
  /**
   * Creates a dynamic entity.
   * @param  {Number}  options.x        The x coordinate of the dynamic entity.
   * @param  {Number}  options.y        The y coordinate of the dynamic entity
   * @param  {Number}  options.width    The width of the dynamic entity.
   * @param  {Number}  options.length   The length of the dynamic entity.
   * @param  {Number}  options.height   The height of the dynamic entity.
   * @param  {Number}  options.angle    The angle of the dynamic entity.
   * @param  {Boolean} options.blocking Is the dynamic entity blocking.
   * @param  {String}  options.type     The type of entity.
   */
  constructor({ type, ...other }) {
    super(other);
    this.type = type;
  }
}

export default DynamicEntity;
