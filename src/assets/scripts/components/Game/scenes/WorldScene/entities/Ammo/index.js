import translate from 'root/translate';
import Item from '../Item';

/**
 * Class representing an ammo item.
 */
class Ammo extends Item {
  /**
   * Creates an ammo item.
   * @param  {Number} options.x       The x coordinate of the body.
   * @param  {Number} options.y       The y coordinate of the body
   * @param  {Number} options.width   The width of the body.
   * @param  {Number} options.length  The length of the body.
   * @param  {Number} options.height  The height of the body.
   * @param  {String} options.texture The texture of entity.
   * @param  {Number} options.amount  The amount of ammo.
   * @param  {String} options.weapon  The weapon the ammo is for.
   */
  constructor({ amount = 0, type, ...other }) {
    super(other);
    this.amount = amount;
    this.type = type;
    this.translation = translate('world.item.ammo', {
      weapon: translate(`world.item.${type}`),
    });
  }
}

export default Ammo;
