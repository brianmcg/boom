import translate from 'root/translate';
import AbstractItem from '../AbstractItem';

/**
 * Class representing a key.
 */
class KeyItem extends AbstractItem {
  /**
   * Creates a key item.
   * @param  {Number} options.x       The x coordinate of the item.
   * @param  {Number} options.y       The y coordinate of the item
   * @param  {Number} options.width   The width of the item.
   * @param  {Number} options.length  The length of the item.
   * @param  {Number} options.height  The height of the item.
   * @param  {String} options.texture The texture of item.
   * @param  {String} options.color   The color of the key.
   */
  constructor({ color, ...other }) {
    super(other);

    this.color = color;
    this.title = translate('world.item.key', {
      color: translate(`world.color.${color}`),
    });
  }
}

export default KeyItem;
