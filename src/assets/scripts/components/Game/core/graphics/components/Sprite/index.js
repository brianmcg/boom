import * as PIXI from 'pixi.js';

/**
 * Class representing a sprite.
 */
class Sprite extends PIXI.Sprite {
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

export default Sprite;
