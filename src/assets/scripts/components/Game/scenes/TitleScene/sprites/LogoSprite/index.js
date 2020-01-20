import { AnimatedSprite } from 'game/core/graphics';

/**
 * Class representing a logo sprite.
 */
class LogoSprite extends AnimatedSprite {
  /**
   * Creates a logo sprite.
   * @param  {Array}  textures [The sprite textures.
   */
  constructor(textures = []) {
    super(textures, {
      animationSpeed: 0.2,
      loop: true,
    });
  }

  /**
   * Play the sprite.
   */
  play() {
    this.visible = true;
  }

  /**
   * Stop the sprite.
   */
  stop() {
    this.visible = false;
  }
}

export default LogoSprite;
