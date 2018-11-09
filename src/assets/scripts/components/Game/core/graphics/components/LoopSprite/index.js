import * as PIXI from 'pixi.js';

/**
 * Class representing an LoopSprite.
 * @extends {PIXI.extras.AnimatedSprite}
 */
class LoopSprite extends PIXI.extras.AnimatedSprite {
  /**
   * Creates a LoopSprite.
   * @param  {Array}  textures The textures to loop.
   * @param  {Number} speed    The speed of the naimation.
   * @param  {Number} tint     The colour of the tint.
   */
  constructor(textures, speed, tint) {
    super(textures);

    this.animationSpeed = speed;
    this.loop = true;

    if (tint) {
      this.tint = tint;
    }

    this.play();
  }
}

export default LoopSprite;
