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
    super(textures, { ...options, loop: false, autoPlay: false });

    this.rotation = Math.random() * Math.PI * 2;

    this.onComplete = () => this.parent.removeChild(this);

    this.on('added', () => this.play());
    this.on('removed', () => this.gotoAndStop(0));
  }
}

export default ExplosionSprite;
