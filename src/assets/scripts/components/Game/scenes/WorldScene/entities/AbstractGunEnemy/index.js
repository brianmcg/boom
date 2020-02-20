import { castRay, isRayCollision } from 'game/core/physics';
import AbstractEnemy from '../AbstractEnemy';

/**
 * Abstract class representing a gun enemy.
 * @extends {AbstractEnemy}
 */
class AbstractGunEnemy extends AbstractEnemy {
  /**
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

    if (this.constructor === AbstractEnemy) {
      throw new TypeError('Can not construct abstract class.');
    }
  }

  /**
   * Attack a target.
   */
  attack() {
    const { player } = this.world;

    const { startPoint, endPoint } = castRay({
      caster: this,
    });

    if (isRayCollision(startPoint, endPoint, player)) {
      player.hurt(this.attackPower);
    }
  }
}

export default AbstractGunEnemy;
