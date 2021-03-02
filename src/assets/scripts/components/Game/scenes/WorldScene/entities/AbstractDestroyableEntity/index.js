import DynamicEntity from '../DynamicEntity';

/**
 * Class representig an explosive entity.
 */
class AbstractDestroyableEntity extends DynamicEntity {
  /**
   * Creates an abstract destroyable entity.
   * @param  {Number}  options.x         The x coordinate of the character.
   * @param  {Number}  options.y         The y coordinate of the character
   * @param  {Number}  options.width     The width of the character.
   * @param  {Number}  options.height    The height of the character.
   * @param  {Number}  options.angle     The angle of the character.
   * @param  {Boolean} options.blocking  Is the dynamic entity blocking.
   * @param  {String}  options.texture   The texture of the actor.
   * @param  {Number}  options.health    The current health of the actor.
   * @param  {Number}  options.maxHealth The maximum health of the actor.
   */
  constructor({ health, spurtType, ...other }) {
    super(other);

    this.health = health;
    this.hits = [];
    this.spurtType = spurtType;
    this.isDestroyable = true;
  }

  /**
   * Update the enemy.
   * @param  {Number} delta The delta time.
   * @param  {Number} elapsedMS The elapsed time.
   */
  update(delta, elapsedMS) {
    super.update(delta, elapsedMS);

    if (this.hits.length) {
      const { damage, angle } = this.hits.reduce((memo, hit) => ({
        angle: memo.angle + hit.angle,
        damage: memo.damage + hit.damage,
      }), {
        damage: 0,
        angle: 0,
      });

      this.hurt(damage, angle / this.hits.length);

      this.hits = [];
    }
  }

  /**
   * Add a hit to the entity.
   * @param {Number} options.damage The damage of the hit.
   * @param {Number} options.angle  The angle of the hit.
   */
  addHit(options) {
    this.hits.push(options);
  }

  /**
   * Hurt the entity.
   * @param  {Number} amount The amount to hurt the entity.
   */
  hurt() {
    if (this.constructor === AbstractDestroyableEntity) {
      throw new TypeError('You have to implement this method.');
    }
  }
}

export default AbstractDestroyableEntity;
