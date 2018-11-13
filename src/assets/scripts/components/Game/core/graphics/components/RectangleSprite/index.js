import * as PIXI from 'pixi.js';
import Sprite from '../Sprite';

class RectangleSprite extends Sprite {
  /**
   * Creates a RectangleSprite.
   * @param  {[type]} options.color [description]
   * @param  {[type]} options.w     [description]
   * @param  {[type]} options.h     [description]
   * @param  {[type]} options.      [description]
   * @return {[type]}               [description]
   */
  constructor({ color, w, h }) {
    const graphics = new PIXI.Graphics();

    super();
    this.alpha = 0.5;
    graphics.beginFill(color, 1);
    graphics.drawRect(0, 0, w, h);
    graphics.endFill();
    this.texture = graphics.generateCanvasTexture();
  }
}

export default RectangleSprite;
