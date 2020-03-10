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
  }) {
    super(text, { font });

    this.x = x;
    this.y = y;
    this.alpha = alpha;

    if (color || color === 0) {
      this.tint = color;
    }
  }

  /**
   * Show the sprite.
   */
  show() {
    this.visible = true;
  }

  /**
   * Hide the sprite.
   */
  hide() {
    this.visible = false;
  }
}

export default TextSprite;
