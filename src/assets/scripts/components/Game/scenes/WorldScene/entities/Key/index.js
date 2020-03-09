import translate from 'root/translate';
import Item from '../Item';

const TYPES = {
  RED: 'red',
  BLUE: 'blue',
  YELLOW: 'yellow',
};

/**
 * Class representing a key.
 */
class Key extends Item {
  /**
   * Creates a key.
   * @param  {Number} options.x       The x coordinate of the body.
   * @param  {Number} options.y       The y coordinate of the body
   * @param  {Number} options.width   The width of the body.
   * @param  {Number} options.length  The length of the body.
   * @param  {Number} options.height  The height of the body.
   * @param  {String} options.texture The texture of entity.
   * @param  {String} options.color   The color of the key.
   */
  constructor({ color, ...other }) {
    super(other);
    this.color = color;

    this.title = translate('world.item.key', {
      color: translate(`world.color.${color}`),
    });
  }

  static get TYPES() {
    return TYPES;
  }
}

export default Key;
