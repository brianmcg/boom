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
}

export default ExplosionSprite;
