import { ENEMY_TYPES } from 'game/constants/assets';
import AbstractGunEnemy from '../AbstractGunEnemy';

/**
 * Class representing an amp enemy.
 */
class Amp extends AbstractGunEnemy {
  /**
   * Creates an amp enemy.
   * @param  {Number} options.x               The x coordinate of the character.
   * @param  {Number} options.y               The y coordinate of the character
   * @param  {Number} options.width           The width of the character.
   * @param  {Number} options.length          The length of the character.
   * @param  {Number} options.height          The height of the character.
   * @param  {Number} options.angle           The angle of the character.
   * @param  {Number} options.maxHealth       The maximum health of the character.
   * @param  {Number} options.maxVelocity     The maximum velocity of the enemy.
   * @param  {Number} options.attackRange     The attack range of the enemy.
   * @param  {Number} options.attackTime      The time between attacks.
   * @param  {Number} options.hurtTime        The time the enemy remains hurt when hit.
   * @param  {Number} options.acceleration    The acceleration of the enemy.
   */
  constructor(options) {
    super(options);

    this.type = ENEMY_TYPES.AMP;
  }
}

export default Amp;
