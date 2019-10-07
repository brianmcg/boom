import { DynamicBody } from '~/core/physics';

/**
 * Creates a character
 * @extends {DynamicBody}
 */
class Actor extends DynamicBody {
  /* Creates a character.
   * @param  {Number} options.x         The x coordinate of the character.
   * @param  {Number} options.y         The y coordinate of the character
   * @param  {Number} options.width     The width of the character.
   * @param  {Number} options.length    The length of the character.
   * @param  {Number} options.height    The height of the character.
   * @param  {Number} options.angle     The angle of the character.
   * @param  {Number} options.maxHealth The maximum health of the character.
   */
  constructor(options = {}) {
    const { maxHealth = 100, ...other } = options;

    super(other);

    this.health = maxHealth;
    this.maxHealth = maxHealth;

    if (this.constructor === Actor) {
      throw new TypeError('Can not construct abstract class.');
    }
  }
}

export default Actor;
