import * as PIXI from 'pixi.js';

/**
 * Class representing an AnimatedSprite.
 * @extends {PIXI.extras.AnimatedSprite}
 */
class AnimatedSprite extends PIXI.extras.AnimatedSprite {
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

export default AnimatedSprite;
