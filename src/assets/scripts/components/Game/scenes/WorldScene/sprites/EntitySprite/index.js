import { Sprite, RectangleSprite } from 'game/core/graphics';

/**
 * Class representing an EntitySprite.
 * @extends {PIXI.Sprite}
 */
class EntitySprite extends Sprite {
  /**
   * Creates an EntitySprite.
   * @param  {Texture} texture The sprite texture.
   */
  constructor(texture, { floorOffset = 0, anchor = [0.5, 1] } = {}) {
    super(texture, { anchor });
    this.zOrder = Number.MAX_VALUE;

    if (floorOffset) {
      this.mask = new RectangleSprite({ anchor });
      this.mask.zOrder = Number.MAX_VALUE;
    }

  }
}

export default EntitySprite;
