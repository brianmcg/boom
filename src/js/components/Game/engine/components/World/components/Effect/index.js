/**
 * Class representing an effect.
 */
class Effect {
  /**
   * Creates an effect.
   * @param  {String} options.sourceId  The id of the source.
   * @param  {String} options.type      The effect type.
   * @param  {Number} options.x         The x coordinate.
   * @param  {Number} options.y         The y coordinate.
   * @param  {Number} options.z         The z coordinate.
   * @param  {World}  options.parent    The world.
   */
  constructor({ sourceId, type, x, y, z = 0, parent }) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.sourceId = sourceId;
    this.parent = parent;
    this.type = type;
  }

  /**
   * Remove the effect from its parent.
   */
  remove() {
    this.parent.removeEffect(this);
  }
}

export default Effect;
