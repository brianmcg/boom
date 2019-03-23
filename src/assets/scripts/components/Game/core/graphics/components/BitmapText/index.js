import { BitmapText as PixiBitmapText } from 'pixi.js';

export default class BitmapText extends PixiBitmapText {
  /**
   * Creates a BitmapText
   * @param  {Object} options The text options
   */
  constructor(options) {
    const { text, font, color } = options;

    super(text, { font });

    if (color) {
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
