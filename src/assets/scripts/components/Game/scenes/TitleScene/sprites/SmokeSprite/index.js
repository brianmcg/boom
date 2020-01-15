import { AnimatedSprite } from 'game/core/graphics';
import { RED } from 'game/constants/colors';

class SmokeSprite extends AnimatedSprite {
  constructor(textures, { alpha = 1 } = {}) {
    super(textures, {
      animationSpeed: 0.2,
      tint: RED,
      loop: true,
    });

    this.alpha = alpha;
  }
}

export default SmokeSprite;
