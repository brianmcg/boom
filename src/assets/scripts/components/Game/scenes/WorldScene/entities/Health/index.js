import translate from 'root/translate';
import Item from '../Item';

/**
 * Class representing a health item.
 */
class Health extends Item {
  /**
   * Creates a health item.
   * @param  {Number} options.x       The x coordinate of the body.
   * @param  {Number} options.y       The y coordinate of the body
   * @param  {Number} options.width   The width of the body.
   * @param  {Number} options.length  The length of the body.
   * @param  {Number} options.height  The height of the body.
   * @param  {String} options.texture The texture of entity.
   * @param  {Number} options.amount  The amount of health.
   */
  constructor({ amount = 0, ...other }) {
    super(other);
    this.amount = amount;
    this.translation = translate('world.item.health');
  }
}

export default Health;
