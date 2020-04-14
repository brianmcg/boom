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
   */
  constructor(textures, {
    animationSpeed = 1,
    tint,
    alpha = 1,
    loop = false,
    anchor,
  } = {}) {
    super(textures, false);

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
   * Pause the sprite.
   */
  pause() {
    super.stop();
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
}

export default AnimatedSprite;
