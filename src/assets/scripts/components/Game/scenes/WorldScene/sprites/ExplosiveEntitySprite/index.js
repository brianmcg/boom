import AnimatedEntitySprite from '../AnimatedEntitySprite';

const EVENTS = {
  ANIMATION_CHANGE: 'sprite:animation:change',
  ANIMATION_COMPLETE: 'sprite:animation:complete',
};

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
  constructor(textures, { entity, ...options }) {
    super(textures, { ...options, loop: false, autoPlay: false });

    entity.onExplode(() => {
      this.emit(EVENTS.ANIMATION_CHANGE);
      this.play();
    });

    this.onComplete = () => {
      this.isComplete = true;
      this.emit(EVENTS.ANIMATION_COMPLETE);
      entity.remove();
    };
  }

  /**
   * Add a callback for the animation change event.
   * @param  {Function} callback The callback function.
   */
  onAnimationChange(callback) {
    this.on(EVENTS.ANIMATION_CHANGE, callback);
  }

  /**
   * Add a callback for the animation complete event.
   * @param  {Function} callback The callback function.
   */
  onAnimationComplete(callback) {
    this.on(EVENTS.ANIMATION_COMPLETE, callback);
  }
}

export default ExplosiveEntitySprite;
