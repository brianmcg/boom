import { Sprite as PixiSprite } from 'pixi.js';

/**
 * Class representing a sprite.
 * @extends {PIXI.Sprite}
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

  /**
   * Show the sprite.
   */
  show() {
    this.visible = true;
  }

  /**
   * Hide the sprite.
   */
  hide() {
    this.visible = false;
  }
}

export default Sprite;
