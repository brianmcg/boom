import { Texture, Sprite } from 'pixi.js';

/**
 * Class representing a rectangle sprite.
 */
class RectangleSprite extends Sprite {
  /**
   * Creates a RectangleSprite.
   * @param  {Number} options.color   The sprite color.
   * @param  {Number} options.width   The sprite width.
   * @param  {Number} options.heigth  The sprite height.
   * @param  {Number} options.alpha   The sprite alpha value.
   */
  constructor({
    color,
    width = 10,
    height = 10,
    alpha = 1,
  }) {
    super();
    this.texture = Texture.WHITE;
    this.width = width;
    this.height = height;
    this.alpha = alpha;

    if (color || color === 0) {
      this.tint = color;
    }
  }
}

export default RectangleSprite;
