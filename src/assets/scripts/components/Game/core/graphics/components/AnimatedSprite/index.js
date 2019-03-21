import { AnimatedSprite as PixiAnimatedSprite } from 'pixi.js';

/**
 * Class representing an AnimatedSprite.
 * @extends {PIXI.extras.AnimatedSprite}
 */
export default class AnimatedSprite extends PixiAnimatedSprite {
  /**
   * [constructor description]
   * @param  {[type]} textures      [description]
   * @param  {[type]} options.animationSpeed [description]
   * @param  {[type]} options.tint  [description]
   * @param  {[type]} options.alpha [description]
   * @param  {[type]} options.loop  [description]
   * @return {[type]}               [description]
   */
  constructor(textures, options) {
    const {
      animationSpeed,
      tint,
      alpha,
      loop,
    } = options;

    super(textures);

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

    this.play();
  }
}
