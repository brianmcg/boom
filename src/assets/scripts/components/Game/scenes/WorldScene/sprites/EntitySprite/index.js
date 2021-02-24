import { Sprite } from 'game/core/graphics';

/**
 * Class representing an EntitySprite.
 * @extends {PIXI.Sprite}
 */
class EntitySprite extends Sprite {
  /**
   * Creates an EntitySprite.
   * @param  {Texture} texture The sprite texture.
   */
  constructor(texture) {
    super(texture, { anchor: 0.5 });
    this.zOrder = Number.MAX_VALUE;
  }
}

export default EntitySprite;
