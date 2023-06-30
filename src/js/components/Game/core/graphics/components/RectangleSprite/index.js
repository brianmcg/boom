import { Texture, Sprite } from 'pixi.js';

/**
 * Class representing a rectangle sprite.
 */
class RectangleSprite extends Sprite {
  /**
   * Creates a RectangleSprite.
   * @param  {Number} options.color   The sprite color.
   * @param  {Number} options.x       The x coordinate.
   * @param  {Number} options.y       The y coordinate.
   * @param  {Number} options.width   The sprite width.
   * @param  {Number} options.heigth  The sprite height.
   * @param  {Number} options.alpha   The sprite alpha value.
   */
  constructor({
    color,
    x = 0,
    y = 0,
    width = 10,
    height = 10,
    alpha = 1,
    anchor = 0,
  } = {}) {
    super(Texture.WHITE);

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.alpha = alpha;

    if (color || color === 0) {
      this.tint = color;
    }

    if (anchor) {
      if (Array.isArray(anchor)) {
        this.anchor.set(...anchor);
      } else {
        this.anchor.set(anchor);
      }
    }
  }
}

export default RectangleSprite;
