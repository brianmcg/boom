import { Sprite } from '~/core/graphics';

/**
 * Class representing an ItemSprite.
 * @extends {PIXI.Sprite}
 */
export default class ItemSprite extends Sprite {
  /**
   * Creates an ItemSprite.
   * @param  {String} image The name of the image.
   */
  constructor(texture) {
    super(texture);
    this.zIndex = 2; // Number.MAX_VALUE;
  }
}
