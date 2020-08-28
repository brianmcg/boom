import AnimatedEntitySprite from '../AnimatedEntitySprite';

/**
 * Class representing an explosive sprite.
 */
class ExplosiveEntitySprite extends AnimatedEntitySprite {
  /**
   * Creates and explosive sprite.
   * @param  {[type]}  entity                 The entity the sprite represents.
   * @param  {Array}   textures               The sprite textures.
   * @param  {Number}  options.animationSpeed The sprite animationSpeed.
   * @param  {Number}  options.tint           The sprite tint.
   * @param  {Number}  options.alpha          The sprite alpha.
   */
  constructor(textures, entity, options) {
    super(textures, {...options, loop: false, autoPlay: false });

    entity.onExplode(() => this.play());

    this.onComplete = () => {
      this.visible = false;
      entity.parent.remove(entity);
    };
  }
}

export default ExplosiveEntitySprite;
