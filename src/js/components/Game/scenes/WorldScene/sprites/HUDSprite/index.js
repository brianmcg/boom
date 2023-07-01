import { Sprite } from '@game/core/graphics';

/**
 * Class representing a hud sprite.
 */
class HUDSprite extends Sprite {
  /**
   * Creates a hud sprite.
   * @param  {Texture} texture          The texture.
   * @param  {Number}  options.maxScale The max scale.
   */
  constructor(texture, { maxScale = 1 } = {}) {
    super(texture);

    this.anchor.set(0.5);
    this.maxScale = maxScale;
    this.scale.set(maxScale);
  }

  /**
   * Update the pause effect.
   * @param  {Number} value The value of the effect.
   */
  fade(value) {
    this.scale.set((1 - value) * this.maxScale);
  }
}

export default HUDSprite;
