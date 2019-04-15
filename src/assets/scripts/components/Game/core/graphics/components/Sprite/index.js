import { Sprite as PixiSprite } from 'pixi.js';

/**
 * Class representing a sprite.
 */
export default class Sprite extends PixiSprite {
  /**
   * The sprite color
   * @param  {Number} value The color to set.
   * @member
   */
  set color(value) {
    this.tint = value;
  }
}
