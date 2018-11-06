import * as PIXI from 'pixi.js';

class BitmapText extends PIXI.extras.BitmapText {
  /**
   * Creates a BitmapText
   * @param  {Object} props The text options
   */
  constructor(props) {
    const { text, font, color } = props;

    super(text, { font });

    if (color) {
      this.tint = color;
    }
  }
}

export default BitmapText;
