import { Sprite as PixiSprite } from 'pixi.js';

/**
 * Class representing a sprite.
 */
class Sprite extends PixiSprite {
  /**
   * Creates a sprite.
   * @param  {Texture} texture      The sprite texture.
   * @param  {Number} options.alpha The alpha value.
   */
  constructor(texture, { alpha = 1 } = {}) {
    super(texture);

    this.alpha = alpha;
  }
}

export default Sprite;
