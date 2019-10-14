import { AnimatedSprite } from '~/core/graphics';

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
   * @param  {Boolean} options.loop           The sprite loop.
   * @param  {Boolean} options.autoPlay       The sprite auto play.
   */
  constructor(...options) {
    super(...options);

    this.hideOnAnimate = true;
    this.zOrder = Number.MAX_VALUE;
  }
}

export default AnimatedEntitySprite;
