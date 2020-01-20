import { AnimatedSprite } from 'game/core/graphics';

/**
 * Creates a menu icon sprite.
 */
class MenuIconSprite extends AnimatedSprite {
  /**
   * Creates a menu icon sprite.
   * @param  {Array}  textures The sprite textures.
   */
  constructor(textures = []) {
    super(textures, {
      animationSpeed: 0.2,
      loop: true,
    });
  }
}

export default MenuIconSprite;
