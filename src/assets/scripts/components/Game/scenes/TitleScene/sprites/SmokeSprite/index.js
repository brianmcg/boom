import { AnimatedSprite } from '~/core/graphics';
import { RED } from '~/constants/colors';

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
