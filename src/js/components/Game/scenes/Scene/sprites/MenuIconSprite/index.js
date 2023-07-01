import { AnimatedSprite } from '@game/core/graphics';

/**
 * Creates a menu icon sprite.
 */
class MenuIconSprite extends AnimatedSprite {
  /**
   * Creates a menu icon sprite.
   * @param  {Array}  textures The sprite textures.
   */
  constructor(textures = [], { size = 1, ...other }) {
    super(textures, {
      ...other,
      animationSpeed: 0.2,
      loop: true,
    });

    this.scaleRatio = size / this.height;
  }
}

export default MenuIconSprite;
