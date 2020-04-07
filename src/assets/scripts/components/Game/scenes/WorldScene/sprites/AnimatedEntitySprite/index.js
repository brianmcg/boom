import { AnimatedSprite } from 'game/core/graphics';

/**
 * Class representing an AnimatedSprite.
 */
class AnimatedEntitySprite extends AnimatedSprite {
  /**
   * Creates an AnimatedEntitySprite.
   * @param  {Array}   textures               The sprite textures.
   * @param  {Number}  options.animationSpeed The sprite animationSpeed.
   * @param  {Number}  options.tint           The sprite tint.
   * @param  {Number}  options.alpha          The sprite alpha.
   */
  constructor(textures, {
    animationSpeed = 0.2,
    loop = true,
  } = {}) {
    super(textures, {
      animationSpeed,
      loop,
    });

    this.zOrder = Number.MAX_VALUE;
  }
}

export default AnimatedEntitySprite;
