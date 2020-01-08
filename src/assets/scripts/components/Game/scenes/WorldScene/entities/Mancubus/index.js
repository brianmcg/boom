import AbstractGunEnemy from '../AbstractGunEnemy';

/**
 * Class representing a mancubus enemy.
 */
class Mancubus extends AbstractGunEnemy {
  /**
   * Creates an abstract enemy.
   * @param  {Number} options.x         The x coordinate of the character.
   * @param  {Number} options.y         The y coordinate of the character
   * @param  {Number} options.width     The width of the character.
   * @param  {Number} options.length    The length of the character.
   * @param  {Number} options.height    The height of the character.
   * @param  {Number} options.angle     The angle of the character.
   * @param  {Number} options.maxHealth The maximum health of the character.
   */
  constructor(options) {
    super(options);
  }
}

export default Mancubus;
