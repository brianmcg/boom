import { DEG } from 'game/core/physics';
import DynamicEntity from '../DynamicEntity';

const DEG_202 = DEG[202];

const DEG_360 = DEG[360];

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
   * @param  {String}  options.type      The type of entity.
   * @param  {Number}  options.maxHealth The maximum health of the character.
   */
  constructor({ maxHealth = 100, ...other }) {
    super(other);

    if (this.constructor === AbstractActor) {
      throw new TypeError('Can not construct abstract class.');
    }

    this.health = maxHealth;
    this.maxHealth = maxHealth;
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

  /**
   * Get the difference between actor angle and player angle.
   * @return {Number} The difference in angle.
   */
  getAngleDiff() {
    const { player } = this.world;

    return (this.angle - player.angle + DEG_202 + DEG_360) % DEG_360;
  }
}

export default AbstractActor;
