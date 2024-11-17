import { AnimatedSprite as PixiAnimatedSprite } from 'pixi.js';

/**
 * Class representing an AnimatedSprite.
 * @extends {PIXI.Sprite}
 */
export default class AnimatedSprite extends PixiAnimatedSprite {
  /**
   * Creates an AnimatedSprite
   * @param  {Array}   textures               The sprite textures.
   * @param  {Number}  options.animationSpeed The sprite animationSpeed.
   * @param  {Number}  options.tint           The sprite tint.
   * @param  {Number}  options.alpha          The sprite alpha.
   * @param  {Boolean} options.loop           The sprite loop.
   * @param  {Number}  options.anchor         The sprite anchor.
   */
  constructor(
    textures,
    { animationSpeed = 1, tint, alpha = 1, loop = false, anchor = 0 } = {}
  ) {
    super(textures, false);

    this.animationSpeed = animationSpeed;

    if (loop || loop === false) {
      this.loop = loop;
    }

    if (alpha || alpha === 0) {
      this.alpha = alpha;
    }

    if (tint || tint === 0) {
      this.tint = tint;
    }

    if (anchor) {
      if (Array.isArray(anchor)) {
        this.anchor.set(...anchor);
      } else {
        this.anchor.set(anchor);
      }
    }
  }

  /**
   * Pause the sprite.
   */
  pause() {
    super.stop();
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
