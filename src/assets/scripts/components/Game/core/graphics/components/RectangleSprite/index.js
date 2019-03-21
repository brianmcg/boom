import * as PIXI from 'pixi.js';
import Sprite from '../Sprite';

class RectangleSprite extends Sprite {
  /**
   * Creates a RectangleSprite.
   * @param  {Number} options.color [description]
   * @param  {Number} options.w     [description]
   * @param  {Number} options.h     [description]
   */
  constructor({ color, w, h }) {
    super();
    const graphics = new PIXI.Graphics();
    graphics.beginFill(color, 1);
    graphics.drawRect(0, 0, w, h);
    graphics.endFill();

    this.texture = PIXI.RenderTexture.create(w, h);
    graphics.destroy();
    // this.alpha = 0.5;
    this.tint = 0xff0000;
  }
}

export default RectangleSprite;
