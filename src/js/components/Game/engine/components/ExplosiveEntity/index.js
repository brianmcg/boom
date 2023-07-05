import AbstractDestroyableEntity from '../AbstractDestroyableEntity';
import Explosion from '../Explosion';

const EXPLODE_EVENT = 'entity:explode';

const EXPLODE_DELAY = 20;

/**
 * Class representig an explosive entity.
 * @extends {DynamicEntity}
 */
class ExplosiveEntity extends AbstractDestroyableEntity {
  /**
   * Creates an explosive entity.
   * @param  {Number}  options.x            The x coordinate of the entity.
   * @param  {Number}  options.y            The y coordinate of the entity.
   * @param  {Number}  options.z            The z coordinate of the entity.
   * @param  {Number}  options.width        The width of the entity.
   * @param  {Number}  options.height       The length of the entity.
   * @param  {Number}  options.height       The height of the entity.
   * @param  {Boolean} options.blocking     The blocking value of the entity.
   * @param  {Number}  options.anchor       The anchor of the entity.
   * @param  {Number}  options.angle        The angle of the entity.
   * @param  {Number}  options.weight       The weight of the entity.
   * @param  {Number}  options.autoPlay     The autopPlay value of the entity.
   * @param  {String}  options.name         The name of the entity.
   * @param  {Object}  options.sounds       The entity sounds.
   * @param  {Object}  options.soundSprite  The entity sound sprite.
   * @param  {Number}  options.scale        The entity scale.
   * @param  {Object}  options.tail         The entity tail.
   * @param  {Number}  options.health       The current health of the entity.
   * @param  {Number}  options.maxHealth    The maximum health of the entity.
   * @param  {Object}  options.effects      The effects of the entity.
   * @param  {Boolean} options.animated     Is the entity animated.
   * @param  {Number}  options.power        The power of the entity.
   * @param  {Number}  options.range        The range of the entity.
   * @param  {Object}  options.explosion    The explosion properties.
   */
  constructor({ animated, explosion, ...other }) {
    super({ sounds: explosion.sounds, ...other });
    this.animated = animated;

    this.isExploding = false;
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
   * @param  {Number} elapsedMS The elapsed time in milliseconds.
   */
  update(delta, elapsedMS) {
    super.update(delta, elapsedMS);

    if (this.isExploding && this.timer < EXPLODE_DELAY) {
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
    if (!this.isExploding) {
      this.health -= amount;

      if (this.health <= 0) {
        this.health = 0;
        this.isExploding = true;
        this.blocking = false;
      }
    }
  }
}

export default ExplosiveEntity;
