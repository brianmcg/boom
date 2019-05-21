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
   */
  constructor(textures, options) {
    const {
      animationSpeed,
      tint,
      alpha,
      loop,
    } = options;

    super(textures, false);

    this.animationSpeed = animationSpeed;

    if (loop) {
      this.loop = loop;
    }

    if (alpha) {
      this.alpha = alpha;
    }

    if (tint) {
      this.tint = tint;
    }
  }
}

export default AnimatedSprite;
