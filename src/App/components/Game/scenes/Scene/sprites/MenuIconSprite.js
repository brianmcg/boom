import { AnimatedSprite } from '@game/core/graphics';

/**
 * Creates a menu icon sprite.
 */
export default class MenuIconSprite extends AnimatedSprite {
  /**
   * Creates a menu icon sprite.
   * @param  {Array}  textures The sprite textures.
   */
  constructor(textures = [], { size = 1, ...other } = {}) {
    super(textures, { ...other, animationSpeed: 0.2, loop: true });

    this.scaleRatio = size / this.height;
  }

  /**
   * Set the scale of the sprite.
   * @param {Number} amount [description]
   */
  setScale(amount = 1) {
    this.scale.set(this.scaleRatio * amount);
  }
}
