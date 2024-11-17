import { Sprite } from '@game/core/graphics';
import { SCREEN } from '@constants/config';

/**
 * Class representing a logo sprite.
 */
export default class LogoSprite extends Sprite {
  /**
   * Creates a logo sprite.
   * @param  {Texture}  texture The sprite texture.
   */
  constructor(texture) {
    super(texture);

    this.maxScale = 1; // SCREEN.HEIGHT / this.height / 2;
    this.anchor.set(0.5);
    this.scale.set(this.maxScale);
  }

  /**
   * Update the pause effect.
   * @param  {Number} value The value of the effect.
   */
  fade(value) {
    this.scale.set((1 - value) * this.maxScale);
  }
}
