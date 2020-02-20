import Item from '../Item';

/**
 * Class representing an ammo item.
 */
class Ammo extends Item {
  /**
   * Creates an ammo item.
   * @param  {Number} options.x      The x coordinate of the body.
   * @param  {Number} options.y      The y coordinate of the body
   * @param  {Number} options.width  The width of the body.
   * @param  {Number} options.length The length of the body.
   * @param  {Number} options.height The height of the body.
   * @param  {String} options.type   The type of entity.
   * @param  {Number} options.amount The amount of ammo.
   * @param  {String} options.weapon The weapon the ammo is for.
   */
  constructor({ amount = 0, weapon, ...other }) {
    super(other);
    this.amount = amount;
    this.weapon = weapon;
  }
}

export default Ammo;
