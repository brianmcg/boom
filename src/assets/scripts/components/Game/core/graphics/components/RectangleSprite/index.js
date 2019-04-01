import { Texture, Sprite } from 'pixi.js';

/**
 * Class representing a rectangle sprite.
 */
export default class RectangleSprite extends Sprite {
  /**
   * Creates a RectangleSprite.
   * @param  {Number} options.color   The sprite color.
   * @param  {Number} options.width   The sprite width.
   * @param  {Number} options.heigth  The sprite height.
   */
  constructor({ color, width = 10, height = 10 }) {
    super();
    this.texture = Texture.WHITE;
    this.width = width;
    this.height = height;

    if (color) {
      this.tint = color;
    }
  }
}
