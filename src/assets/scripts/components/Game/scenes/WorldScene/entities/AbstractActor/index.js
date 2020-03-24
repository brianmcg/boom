import DynamicEntity from '../DynamicEntity';

/**
 * Abstract class representing an actor.
 * @extends {DynamicEntity}
 */
class AbstractActor extends DynamicEntity {
  /**
   * Creates an abstract actor.
   * @param  {Number}  options.x         The x coordinate of the character.
   * @param  {Number}  options.y         The y coordinate of the character
   * @param  {Number}  options.width     The width of the character.
   * @param  {Number}  options.length    The length of the character.
   * @param  {Number}  options.height    The height of the character.
   * @param  {Number}  options.angle     The angle of the character.
   * @param  {Boolean} options.blocking  Is the dynamic entity blocking.
   * @param  {String}  options.texture   The texture of the actor.
   * @param  {Number}  options.health    The current health of the actor.
   * @param  {Number}  options.maxHealth The maximum health of the actor.
   */
  constructor({ maxHealth = 100, health, ...other }) {
    super(other);

    if (this.constructor === AbstractActor) {
      throw new TypeError('Can not construct abstract class.');
    }

    this.health = health !== undefined ? health : maxHealth;
    this.maxHealth = maxHealth;
    this.isActor = true;
  }

  /**
   * Is the enemy alive.
   * @return {Boolean}
   */
  isAlive() {
    if (this.constructor === AbstractActor) {
      throw new TypeError('You have to implement this method.');
    }
  }
}

export default AbstractActor;
