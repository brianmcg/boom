import { AnimatedSprite as PixiAnimatedSprite } from 'pixi.js';

/**
 * @namespace
 */

/**
 * Class representing an AnimatedSprite.
 * @extends {PIXI.extras.AnimatedSprite}
 */
class AnimatedSprite extends PixiAnimatedSprite {
  /**
   * [constructor description]
   * @param  {Array}   textures               [description]
   * @param  {Number}  options.animationSpeed [description]
   * @param  {Number}  options.tint           [description]
   * @param  {Number}  options.alpha          [description]
   * @param  {Boolean} options.loop           [description]
   * @param  {Boolean} options.autoPlay       [description]
   */
  constructor(textures, options) {
    const {
      animationSpeed = 1,
      tint = 0,
      alpha = 1,
      loop = false,
      autoPlay = true,
      autoAnimate = true,
    } = options;

    super(textures, false);

    this.autoAnimate = autoAnimate;
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
