import DynamicEntity from '../DynamicEntity';

/**
 * Abstract class representing an actor.
 * @extends {DynamicEntity}
 */
class AbstractActor extends DynamicEntity {
  /**
   * Creates an abstract actor.
   * @param  {Number} options.x         The x coordinate of the character.
   * @param  {Number} options.y         The y coordinate of the character
   * @param  {Number} options.width     The width of the character.
   * @param  {Number} options.length    The length of the character.
   * @param  {Number} options.height    The height of the character.
   * @param  {Number} options.angle     The angle of the character.
   * @param  {Number} options.maxHealth The maximum health of the character.
   */
  constructor({ velocity, rotVelocity, ...options }) {
    const { maxHealth = 100, ...other } = options;

    super(other);

    if (this.constructor === AbstractActor) {
      throw new TypeError('Can not construct abstract class.');
    }

    this.health = maxHealth;
    this.maxHealth = maxHealth;
    this.velocity = velocity;
    this.rotVelocity = rotVelocity;
  }

  /**
   * Set the state.
   * @param {String} state The state.
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;
      return true;
    }

    return false;
  }
}

export default AbstractActor;
