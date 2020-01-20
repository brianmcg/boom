import { AnimatedSprite } from 'game/core/graphics';
import { RED } from 'game/constants/colors';

/**
 * Class representing a smoke sprite.
 */
class SmokeSprite extends AnimatedSprite {
  /**
   * Creates a smoke sprite.
   * @param  {Array}  textures      The sprite textures.
   * @param  {Number} options.alpha The alpha value.
   */
  constructor(textures = [], { alpha = 1 } = {}) {
    super(textures, {
      animationSpeed: 0.2,
      tint: RED,
      loop: true,
    });

    this.alpha = alpha;
  }
}

export default SmokeSprite;
