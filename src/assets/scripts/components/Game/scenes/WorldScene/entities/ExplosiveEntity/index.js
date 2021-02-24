import { degrees } from 'game/core/physics';
import DynamicEntity from '../DynamicEntity';

const EXPLODE_EVENT = 'entity:explode';

const EXPLODE_DELAY = 200;

const DEGREES_360 = degrees(360);

const DEGREES_180 = degrees(180);

/**
 * Class representig an explosive entity.
 */
class ExplosiveEntity extends DynamicEntity {
  /**
   * Creates an explosive entity.
   * @param  {Boolean} options.animated      Is the entity animated.
   * @param  {String}  options.explosionType The explosion type.
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
    explosionType,
    health,
    power,
    range,
    ...other
  }) {
    super(other);
    this.animated = animated;
    this.explosionType = explosionType;
    this.health = health;
    this.power = power;
    this.range = range;
    this.isExplosive = true;
    this.timer = 0;

    this.onExplode(() => {
      this.parent.addExplosion({
        x: this.x,
        y: this.y,
        z: this.z,
        sourceId: `${this.id}_${this.explosionType}`,
        parent: this.parent,
        flash: this.power,
        shake: this.power,
      });

      this.parent.getAdjacentBodies(this, this.range).forEach((body) => {
        if (body.hurt) {
          const angle = (body.getAngleTo(this) - DEGREES_180 + DEGREES_360) % DEGREES_360;
          const distance = this.getDistanceTo(body);
          const damage = Math.max(1, this.power - Math.round(distance));

          body.hurt(damage, angle);
        }
      });

      this.emitSound(this.sounds.explode);
    });
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
