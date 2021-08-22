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
  constructor({
    maxHealth = 100,
    health,
    effects,
    ...other
  }) {
    super(other);

    this.health = health !== undefined ? health : maxHealth;
    this.maxHealth = maxHealth;
    this.effects = effects;
    this.hits = [];
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
      const totalDamage = this.hits.reduce((memo, { damage }) => memo + damage, 0);

      if (totalDamage) {
        const { length } = this.hits;

        const { x, y } = this.hits.reduce((memo, { angle }) => ({
          x: memo.x + Math.cos(angle),
          y: memo.y + Math.sin(angle),
        }), { x: 0, y: 0 });

        const meanAngle = Math.atan2(y / length, x / length);

        this.hurt(totalDamage, meanAngle);

        this.hits = [];
      }
    }
  }

  /**
   * Add a hit to the entity.
   * @param {Number} options.damage The damage of the hit.
   * @param {Number} options.angle  The angle of the hit.
   * @param {Array}  options.rays   The ray sections.
   * @param {Object} options.point  The point of the collision.
   */
  hit(options) {
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
