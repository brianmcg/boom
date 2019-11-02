import { BitmapText } from 'pixi.js';

/**
 * Class representing a bitmap text.
 */
class TextSprite extends BitmapText {
  /**
   * Creates a bitmap text.
   * @param  {String} options.text  [description]
   * @param  {String} options.font  [description]
   * @param  {Number} options.color [description]
   * @param  {Number} options.x     [description]
   * @param  {Number} options.y     [description]
   */
  constructor({
    text,
    font,
    color,
    x = 0,
    y = 0,
  }) {
    super(text, { font });

    this.x = x;
    this.y = y;

    if (color || color === 0) {
      this.tint = color;
    }
  }

  /**
   * The the color of the bitmap text.
   * @param {Number} color A hex number representing the color.
   */
  setColor(color) {
    this.tint = color;
  }
}

export default TextSprite;
