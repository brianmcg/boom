import { AnimatedSprite } from 'game/core/graphics';

class IconSprite extends AnimatedSprite {
  constructor(textures) {
    super(textures, {
      animationSpeed: 0.2,
      loop: true,
    });
  }
}

export default IconSprite;
