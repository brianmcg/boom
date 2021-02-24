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
  constructor(textures, { animationSpeed = 0.2, loop = true, autoPlay = true } = {}) {
    super(textures, { animationSpeed, loop, anchor: 0.5 });

    this.zOrder = Number.MAX_VALUE;

    if (autoPlay) {
      this.play();
    }
  }
}

export default AnimatedEntitySprite;
