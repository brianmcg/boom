import AnimatedEntitySprite from '../AnimatedEntitySprite';

/**
 * Class representing an explosion sprite.
 */
class ExplosionSprite extends AnimatedEntitySprite {
  /**
   * Creates an explosion sprite.
   * @param  {Array}  textures The explosion textures.
   * @param  {Object} options  The animated sprite options.
   */
  constructor(textures, options) {
    super(textures, { ...options, loop: false });

    this.onComplete = () => {
      this.gotoAndStop(0);
      this.parent.removeChild(this);
    };
  }

  /**
   * Check if the sprite should be updated.
   * @return {Boolean} Should sprite be updated.
   */
  isUpdateable() {
    return !!this.parent;
  }
}

export default ExplosionSprite;
