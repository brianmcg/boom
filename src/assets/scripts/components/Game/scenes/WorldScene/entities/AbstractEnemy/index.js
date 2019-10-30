import AbstractActor from '../AbstractActor';
import { DEG } from '~/core/physics';

/**
 * Abstract class representing an enemy.
 * @extends {AbstractActor}
 */
class AbstractEnemy extends AbstractActor {
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
  constructor({ type, ...options }) {
    super(options);
    this.velocity = 1;
    this.rotVelocity = DEG[1];
    this.type = type;

    if (this.constructor === AbstractEnemy) {
      throw new TypeError('Can not construct abstract class.');
    }
  }

  get angleDiff() {
    const { player } = this.world;
    const diff = this.angle - player.angle;

    return (diff + DEG[203] + DEG[360]) % DEG[360];
  }
}

export default AbstractEnemy;
