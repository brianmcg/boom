/**
 * Class representing an effect.
 */
class Effect {
  /**
   * Creates an explosion.
   * @param  {String} options.id    The explosion id.
   * @param  {String} options.type  The explosion type.
   * @param  {Number} options.x     The x coordinate.
   * @param  {Number} options.y     The y coordinate.
   * @param  {World}  options.world The world.
   */
  constructor({
    sourceId,
    type,
    x,
    y,
    z = 0,
    parent,
  }) {
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
