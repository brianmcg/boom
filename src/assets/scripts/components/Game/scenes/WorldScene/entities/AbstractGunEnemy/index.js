import AbstractEnemy from '../AbstractEnemy';

/**
 * Abstract class representing a gun enemy.
 * @extends {AbstractEnemy}
 */
class AbstractGunEnemy extends AbstractEnemy {
  /**
   * Creates an abstract shooter.
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

    if (this.constructor === AbstractEnemy) {
      throw new TypeError('Can not construct abstract class.');
    }

    this.setPatrolling();
  }
}

export default AbstractGunEnemy;
