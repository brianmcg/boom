const TIME_TO_LIVE = 2000;

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
    this.timer = 0;
    this.parent = parent;
    this.type = type;
  }

  /**
   * Updates the explosion.
   * @param  {Number} delta The delta time.
   */
  update(delta, elapsedMS) {
    this.timer += elapsedMS;

    if (this.timer >= TIME_TO_LIVE) {
      this.parent.removeEffect(this);
    }
  }
}

export default Effect;
