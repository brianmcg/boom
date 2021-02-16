import { TIME_STEP } from 'game/constants/config';

const TIME_TO_LIVE = 2000;

/**
 * Class representing an explosion.
 */
class Explosion {
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
    this.isTriggered = true;
  }

  /**
   * Updates the explosion.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    this.isTriggered = false;

    this.timer += TIME_STEP * delta;

    if (this.timer >= TIME_TO_LIVE) {
      this.timer = 0;
      this.parent.removeExplosion(this);
    }
  }
}

export default Explosion;
