import AbstractDestroyableEntity from '../AbstractDestroyableEntity';
import Explosion from '../Explosion';

const EXPLODE_EVENT = 'entity:explode';

const EXPLODE_DELAY = 20;

/**
 * Class representig an explosive entity.
 */
class ExplosiveEntity extends AbstractDestroyableEntity {
  /**
   * Creates an explosive entity.
   * @param  {Boolean} options.animated      Is the entity animated.
   * @param  {Object}  options.effects       The effects.
   * @param  {Number}  options.health        The health of the entity.
   * @param  {Number}  options.power         The power of the entity.
   * @param  {Number}  options.range         The range of the entity.
   * @param  {Number}  options.x             The x coordinate of the dynamic entity.
   * @param  {Number}  options.y             The y coordinate of the dynamic entity
   * @param  {Number}  options.width         The width of the dynamic entity.
   * @param  {Number}  options.height        The height of the dynamic entity.
   * @param  {Number}  options.angle         The angle of the dynamic entity.
   * @param  {Boolean} options.blocking      Is the dynamic entity blocking.
   * @param  {String}  options.texture       The texture of entity.
   * @param  {String}  options.sounds        The sounds of entity.
   */
  constructor({
    animated,
    power,
    range,
    explosion,
    ...other
  }) {
    super(other);
    this.animated = animated;

    this.isExplosive = true;
    this.timer = 0;

    this.explosion = new Explosion({ source: this, ...explosion });

    this.onExplode(() => this.explosion.run());
  }

  /**
   * Add a callback to the explode event.
   * @param  {Function} callback The callback to add.
   */
  onExplode(callback) {
    this.on(EXPLODE_EVENT, callback);
  }

  /**
   * Update the entity.
   * @param  {Number} delta The delta time.
   */
  update(delta, elapsedMS) {
    super.update(delta, elapsedMS);

    if (!this.isExplosive && this.timer < EXPLODE_DELAY) {
      this.timer += elapsedMS;

      if (this.timer >= EXPLODE_DELAY) {
        this.timer = EXPLODE_DELAY;
        this.emit(EXPLODE_EVENT);
      }
    }
  }

  /**
   * Hurt the entity.
   * @param  {Number} amount The amount to hurt the entity.
   */
  hurt(amount) {
    if (this.isExplosive) {
      this.health -= amount;

      if (this.health <= 0) {
        this.health = 0;
        this.isExplosive = false;
      }
    }
  }
}

export default ExplosiveEntity;
