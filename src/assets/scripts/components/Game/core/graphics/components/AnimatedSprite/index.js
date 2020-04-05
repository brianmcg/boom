import { AnimatedSprite as PixiAnimatedSprite } from 'pixi.js';

/**
 * Class representing an AnimatedSprite.
 * @extends {PIXI.Sprite}
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
  constructor(textures, {
    animationSpeed = 1,
    tint,
    alpha = 1,
    loop = false,
    autoPlay = true,
    anchor,
  } = {}) {
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

    if (anchor) {
      this.anchor.set(anchor);
    }
  }

  /**
   * Set the sprite scale.
   * @param {Number} amount the scale amount.
   */
  setScale(amount) {
    this.scale.x = amount;
    this.scale.y = amount;
  }

  /**
   * Show the sprite.
   */
  show() {
    this.visible = true;
  }

  /**
   * Hide the sprite.
   */
  hide() {
    this.visible = false;
  }

  /**
   * Check if the sprite should be updated.
   * @return {Boolean} Should sprite be updated.
   */
  isUpdateable() {
    return this.visible;
  }
}

export default AnimatedSprite;
