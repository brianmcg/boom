import translate from 'root/translate';
import AbstractItem from '../AbstractItem';

/**
 * Class representing a health item.
 */
class HealthItem extends AbstractItem {
  /**
   * Creates a health item.
   * @param  {Number} options.x       The x coordinate of the item.
   * @param  {Number} options.y       The y coordinate of the item
   * @param  {Number} options.width   The width of the item.
   * @param  {Number} options.length  The length of the item.
   * @param  {Number} options.height  The height of the item.
   * @param  {String} options.texture The texture of item.
   * @param  {Number} options.amount  The amount of health.
   */
  constructor({ amount = 0, ...other }) {
    super(other);

    this.amount = amount;
    this.title = translate('world.item.health');
  }
}

export default HealthItem;
