import { AnimatedSprite } from 'game/core/graphics';

class SparksSprite extends AnimatedSprite {
  constructor(textures) {
    super(textures, {
      animationSpeed: 0.4,
      loop: true,
    });
  }
}

export default SparksSprite;
