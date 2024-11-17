import { Sprite as PixiSprite } from 'pixi.js';

/**
 * Class representing a sprite.
 * @extends {PIXI.Sprite}
 */
class Sprite extends PixiSprite {
  /**
   * Creates a sprite.
   * @param  {Texture} texture       The sprite texture.
   * @param  {Number} options.alpha  The alpha value.
   * @param  {Number} options.anchor The sprite anchor.
   * @param  {Number} options.width  The sprite width.
   * @param  {Number} options.height The sprite height.
   */
  constructor(texture, { alpha = 1, anchor = 0, width, height, tint } = {}) {
    super(texture);

    this.alpha = alpha;

    if (anchor) {
      if (Array.isArray(anchor)) {
        this.anchor.set(...anchor);
      } else {
        this.anchor.set(anchor);
      }
    }

    if (width || width === 0) {
      this.width = width;
    }

    if (height || width === 0) {
      this.height = height;
    }

    if (tint || tint === 0) {
      this.tint = tint;
    }
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
   * Set the sprite state
   * @param {String} state The state to set.
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }
}

export default Sprite;
