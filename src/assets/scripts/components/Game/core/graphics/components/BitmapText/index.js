import * as PIXI from 'pixi.js';

class BitmapText extends PIXI.extras.BitmapText {
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

export default BitmapText;
