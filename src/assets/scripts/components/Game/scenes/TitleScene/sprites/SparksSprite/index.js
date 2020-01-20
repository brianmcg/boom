import { AnimatedSprite } from 'game/core/graphics';

/**
 * Class representing a sparks sprite.
 */
class SparksSprite extends AnimatedSprite {
  /**
   * Creates a sparks sprite.
   * @param  {Array}  textures The sprite textures.
   */
  constructor(textures = []) {
    super(textures, {
      animationSpeed: 0.4,
      loop: true,
    });
  }
}

export default SparksSprite;
