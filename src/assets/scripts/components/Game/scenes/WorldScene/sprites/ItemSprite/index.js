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
    this.zOrder = Number.MAX_VALUE;
    this.hideOnAnimate = true;
  }
}
