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

  setColor(color) {
    this.tint = color;
  }
}
