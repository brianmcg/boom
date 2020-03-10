import translate from 'root/translate';
import AbstractItem from '../AbstractItem';

/**
 * Class representing a weapon item.
 */
class WeaponItem extends AbstractItem {
  /**
   * Creates an ammo item.
   * @param  {Number} options.x       The x coordinate of the item.
   * @param  {Number} options.y       The y coordinate of the item
   * @param  {Number} options.width   The width of the item.
   * @param  {Number} options.length  The length of the item.
   * @param  {Number} options.height  The height of the item.
   * @param  {String} options.texture The texture of item.
   */
  constructor({ type, ...other }) {
    super(other);

    this.type = type;
    this.title = translate(`world.item.${type}`);
  }
}

export default WeaponItem;
