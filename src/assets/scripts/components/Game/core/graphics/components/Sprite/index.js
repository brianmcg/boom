import { Sprite as PixiSprite } from 'pixi.js';

/**
 * Class representing a sprite.
 * @extends {PIXI.Sprite}
 */
class Sprite extends PixiSprite {
  /**
   * Creates a sprite.
   * @param  {Texture} texture      The sprite texture.
   * @param  {Number} options.alpha The alpha value.
   */
  constructor(texture, { alpha = 1 } = {}) {
    super(texture);

    this.alpha = alpha;
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
