import { SCREEN } from '@constants/config';
import { BitmapText } from 'pixi.js';

/**
 * Class representing a bitmap text.
 */
export default class TextSprite extends BitmapText {
  /**
   * Creates a bitmap text.
   * @param  {String} options.text  The text.
   * @param  {String} options.font  The font.
   * @param  {Number} options.color The color.
   * @param  {Number} options.x     The x xoordinate.
   * @param  {Number} options.y     The y coordinate.
   * @param  {Number} options.alpha The alpha value.
   */
  constructor({
    text,
    fontFamily,
    fontSize,
    color,
    x = 0,
    y = 0,
    alpha = 1,
    anchor,
    maxWidth = SCREEN.WIDTH,
  }) {
    super({ text, style: { fontFamily, fontSize } });

    this.x = x;
    this.y = y;
    this.alpha = alpha;
    this.maxWidth = maxWidth;

    if (color || color === 0) {
      this.tint = color;
    }

    if (anchor) {
      this.anchor.set(anchor);
    }
  }

  /**
   * Update the pause effect.
   * @param  {Number} value The value of the effect.
   */
  fade(value) {
    this.scale.set(1 - value);
  }

  /**
   * Destroy the text sprite.
   * @param  {Object} options The destroy options.
   */
  destroy(options = {}) {
    super.destroy({ ...options, texture: true });
  }
}
