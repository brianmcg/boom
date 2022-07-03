import AnimatedEntitySprite from '../AnimatedEntitySprite';

/**
 * Class representing an explosion sprite.
 */
class EffectSprite extends AnimatedEntitySprite {
  /**
   * Creates an explosion sprite.
   * @param  {Array}  textures The explosion textures.
   * @param  {Object} options  The animated sprite options.
   */
  constructor(textures, { rotate = true, ...other }) {
    super(textures, {
      ...other,
      loop: false,
      autoPlay: false,
      anchor: 0.5,
    });

    if (rotate) {
      this.rotation = Math.random() * Math.PI * 2;
    }

    this.on('added', () => this.play());
    this.on('removed', () => this.gotoAndStop(0));
  }
}

export default EffectSprite;
