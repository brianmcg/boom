import { AnimatedSprite } from 'game/core/graphics';
import { RED } from 'game/constants/colors';

class SmokeSprite extends AnimatedSprite {
  constructor(textures) {
    super(textures, {
      animationSpeed: 0.2,
      tint: RED,
      loop: true,
    });
  }
}

export default SmokeSprite;
