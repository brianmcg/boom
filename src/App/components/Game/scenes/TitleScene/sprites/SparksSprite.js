import { AnimatedSprite } from '@game/core/graphics';
import { SCREEN } from '@constants/config';

/**
 * Class representing a sparks sprite.
 */
export default class SparksSprite extends AnimatedSprite {
  /**
   * Creates a sparks sprite.
   * @param  {Array}  textures The sprite textures.
   */
  constructor(textures = []) {
    super(textures, {
      animationSpeed: 0.4,
      loop: true,
    });

    const ratio = SCREEN.WIDTH / this.width;

    this.height *= ratio;
    this.width *= ratio;

    this.y = SCREEN.HEIGHT - this.height;
  }
}
