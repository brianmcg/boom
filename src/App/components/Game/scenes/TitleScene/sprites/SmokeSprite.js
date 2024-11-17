import { AnimatedSprite } from '@game/core/graphics';
import { SCREEN } from '@constants/config';

/**
 * Class representing a smoke sprite.
 */
export default class SmokeSprite extends AnimatedSprite {
  /**
   * Creates a smoke sprite.
   * @param  {Array}  textures      The sprite textures.
   */
  constructor(textures = []) {
    super(textures, {
      animationSpeed: 0.3,
      loop: true,
    });

    this.x = SCREEN.WIDTH / 2 - this.width / 2;
    this.y = SCREEN.HEIGHT - this.height;
    this.alpha = 0.5;
  }
}
