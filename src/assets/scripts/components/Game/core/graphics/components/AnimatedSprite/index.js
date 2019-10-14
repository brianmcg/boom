import { AnimatedSprite as PixiAnimatedSprite } from 'pixi.js';

/**
 * Class representing an AnimatedSprite.
 * @extends {PixiAnimatedSprite}
 */
class AnimatedSprite extends PixiAnimatedSprite {
  /**
   * Creates an AnimatedSprite
   * @param  {Array}   textures               The sprite textures.
   * @param  {Number}  options.animationSpeed The sprite animationSpeed.
   * @param  {Number}  options.tint           The sprite tint.
   * @param  {Number}  options.alpha          The sprite alpha.
   * @param  {Boolean} options.loop           The sprite loop.
   * @param  {Boolean} options.autoPlay       The sprite auto play.
   */
  constructor(textures, options) {
    const {
      animationSpeed = 1,
      tint,
      alpha = 1,
      loop = false,
      autoPlay = true,
    } = options;

    super(textures, false);

    this.autoPlay = autoPlay;
    this.animationSpeed = animationSpeed;

    if (loop || loop === false) {
      this.loop = loop;
    }

    if (alpha || alpha === 0) {
      this.alpha = alpha;
    }

    if (tint) {
      this.tint = tint;
    }
  }
}

export default AnimatedSprite;
