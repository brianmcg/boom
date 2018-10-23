import * as PIXI from 'pixi.js';
import { SCREEN } from '../../constants';

export default class BitmapText extends PIXI.extras.BitmapText {
  /**
   * Creates a BitmapText
   * @param  {Object} props The text options
   * @return {[type]}       [description]
   */
  constructor(props) {
    const {
      text,
      font,
      center,
      color,
    } = props;

    super(text, { font });

    if (center) {
      this.x = (SCREEN.WIDTH / 2) - (this.width / 2);
      this.y = (SCREEN.HEIGHT / 2) - (this.height / 2);
    }

    if (color) {
      this.tint = color;
    }
  }
}
