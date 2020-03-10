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
   * @param  {String} options.weapon  The weapon this item contains.
   * @param  {String} options.type    The item type.
   */
  constructor({ weapon, ...other }) {
    super(other);

    this.weapon = weapon;
    this.title = translate(`world.item.${weapon}`);
  }
}

export default WeaponItem;
