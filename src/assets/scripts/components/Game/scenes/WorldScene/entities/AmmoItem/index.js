import translate from 'root/translate';
import AbstractItem from '../AbstractItem';

/**
 * Class representing an ammo item.
 */
class AmmoItem extends AbstractItem {
  /**
   * Creates an ammo item.
   * @param  {Number} options.x       The x coordinate of the item.
   * @param  {Number} options.y       The y coordinate of the item
   * @param  {Number} options.width   The width of the item.
   * @param  {Number} options.length  The length of the item.
   * @param  {Number} options.height  The height of the item.
   * @param  {String} options.texture The texture of item.
   * @param  {Number} options.amount  The amount of ammo.
   * @param  {String} options.weapon  The weapon the ammo is for.
   */
  constructor({ amount = 0, weapon, ...other }) {
    super(other);

    this.amount = amount;
    this.weapon = weapon;
    this.title = translate('world.item.ammo', {
      weapon: translate(`world.item.${weapon}`),
    });
  }
}

export default AmmoItem;
