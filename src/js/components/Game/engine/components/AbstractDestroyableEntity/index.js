import DynamicEntity from '../DynamicEntity';

/**
 * Class representig an explosive entity.
 * @extends {DynamicEntity}
 */
class AbstractDestroyableEntity extends DynamicEntity {
  /**
   * Creates an abstract destroyable entity.
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
   */
  constructor({ maxHealth = 100, health, effects, ...other }) {
    super(other);

    this.health = health !== undefined ? health : maxHealth;
    this.maxHealth = maxHealth;
    this.effects = effects;
    this.hits = [];
    this.isDestroyable = true;
  }

  /**
   * Update the enemy.
   * @param  {Number} delta     The delta time.
   * @param  {Number} elapsedMS The elapsed time in milliseconds.
   */
  update(delta, elapsedMS) {
    super.update(delta, elapsedMS);

    if (this.hits.length) {
      const totalDamage = this.hits.reduce(
        (memo, { damage }) => memo + damage,
        0,
      );
      const instantKill = this.hits.some(h => h.instantKill);

      if (totalDamage) {
        const { length } = this.hits;

        const { x, y } = this.hits.reduce(
          (memo, { angle }) => ({
            x: memo.x + Math.cos(angle),
            y: memo.y + Math.sin(angle),
          }),
          { x: 0, y: 0 },
        );

        const meanAngle = Math.atan2(y / length, x / length);

        this.hurt(totalDamage, meanAngle, instantKill);

        this.hits = [];
      }
    }
  }

  /**
   * Add a hit to the entity.
   * @param {Number}  options.damage       The damage of the hit.
   * @param {Number}  options.angle        The angle of the hit.
   * @param {Array}   options.rays         The ray sections.
   * @param {Object}  options.point        The point of the collision.
   * @param {Boolean} options.instantKill  The hit instantly kills.
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
