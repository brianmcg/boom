import { DynamicBody, DEG } from 'game/core/physics';

const DEG_203 = DEG[203];

const DEG_360 = DEG[360];

/**
 * Class representing a dynamic entity.
 * @extends {DynamicBody}
 */
class DynamicEntity extends DynamicBody {
  /**
   * Creates a dynamic entity.
   * @param  {Number} options.x      The x coordinate of the dynamic body.
   * @param  {Number} options.y      The y coordinate of the dynamic body
   * @param  {Number} options.width  The width of the dynamic body.
   * @param  {Number} options.length The length of the dynamic body.
   * @param  {Number} options.height The height of the dynamic body.
   * @param  {Number} options.angle  The angle of the dynamic body.
   * @param  {String} options.type   The type of entity.
   */
  constructor({ type, ...other }) {
    super(other);
    this.type = type;
  }

  get angleDiff() {
    const { player } = this.world;

    return (this.angle - player.angle + DEG_203 + DEG_360) % DEG_360;
  }
}

export default DynamicEntity;
