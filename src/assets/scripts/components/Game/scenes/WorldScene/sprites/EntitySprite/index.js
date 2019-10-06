import { Sprite } from '~/core/graphics';

/**
 * Class representing an EntitySprite.
 * @extends {PIXI.Sprite}
 */
class EntitySprite extends Sprite {
  /**
   * Creates an EntitySprite.
   * @param  {String} image The name of the image.
   */
  constructor(texture) {
    super(texture);
    this.zOrder = Number.MAX_VALUE;
    this.hideOnAnimate = true;
  }
}

export default EntitySprite;
