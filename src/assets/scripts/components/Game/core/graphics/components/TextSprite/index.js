import { BitmapText } from 'pixi.js';

/**
 * Class representing a bitmap text.
 */
class TextSprite extends BitmapText {
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
    font,
    color,
    x = 0,
    y = 0,
    alpha = 1,
    anchor,
  }) {
    super(text, { font });

    this.x = x;
    this.y = y;
    this.alpha = alpha;

    if (color || color === 0) {
      this.tint = color;
    }

    if (anchor) {
      this.anchor.set(anchor);
    }
  }

  /**
   * Set the sprite scale.
   * @param {Number} amount the scale amount.
   */
  setScale(amount) {
    this.scale.x = amount;
    this.scale.y = amount;
  }

  /**
   * Update the pause effect.
   * @param  {Number} value The value of the effect.
   */
  fade(value) {
    this.setScale(1 - value);
  }
}

export default TextSprite;
