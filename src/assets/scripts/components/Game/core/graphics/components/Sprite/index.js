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
   * The frame width.
   * @return {Number}
   */
  get frameWidth() {
    return this.texture.frame.width;
  }

  /**
   * The frame height.
   * @return {Number}
   */
  get frameHeight() {
    return this.texture.frame.height;
  }

  /**
   * The frame x coordinate.
   * @return {Number}
   */
  get frameX() {
    return this.x - ((this.width - this.frameWidth + 1) / 2);
  }

  /**
   * The frame y coordinate.
   * @return {Number}
   */
  get frameY() {
    return this.y - (this.height - this.frameHeight) - 1;
  }
}

export default Sprite;
