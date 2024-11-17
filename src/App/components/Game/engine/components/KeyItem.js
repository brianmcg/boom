import translate from '@util/translate';
import AbstractItem from './AbstractItem';

/**
 * Class representing a key.
 * @extends {AbstractItem}
 */
export default class KeyItem extends AbstractItem {
  /**
   * Creates a key item.
   * @param  {Number}  options.x              The x coordinate of the item.
   * @param  {Number}  options.y              The y coordinate of the item.
   * @param  {Number}  options.z              The z coordinate of the item.
   * @param  {Number}  options.width          The width of the item.
   * @param  {Number}  options.height         The length of the item.
   * @param  {Number}  options.height         The height of the item.
   * @param  {Boolean} options.blocking       The blocking value of the item.
   * @param  {Number}  options.anchor         The anchor of the item.
   * @param  {Number}  options.angle          The angle of the item.
   * @param  {Number}  options.weight         The weight of the item.
   * @param  {Number}  options.autoPlay       The autopPlay value of the item.
   * @param  {String}  options.name           The name of the item.
   * @param  {Object}  options.sounds         The item sounds.
   * @param  {Object}  options.soundSprite    The item sound sprite.
   * @param  {Number}  options.scale          The item scale.
   * @param  {Object}  options.tail           The item tail.
   * @param  {String}  options.type           The type of item.
   * @param  {Number}  options.floorOffset    The floor offset.
   * @param  {Number}  options.respawn        The time to respawn.
   * @param  {String}  options.color          The color of the key.
   */
  constructor({ color, ...other }) {
    super(other);

    this.color = color;
    this.isKey = true;
    this.title = translate('world.item.key', {
      color: translate(`world.color.${color}`),
    });
  }
}
