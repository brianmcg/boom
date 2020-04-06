import { Sprite } from 'game/core/graphics';

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
    this.setScale(maxScale);
  }

  /**
   * Update the pause effect.
   * @param  {Number} value The value of the effect.
   */
  updateFadeEffect(value) {
    this.setScale((1 - value) * this.maxScale);
  }
}

export default HUDSprite;
