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
    id,
    type,
    x,
    y,
    world,
  }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.timer = 0;
    this.world = world;
    this.type = type;
  }

  /**
   * Updates the explosion.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    if (this.isStarted) {
      this.timer += TIME_STEP * delta;

      if (this.timer >= TIME_TO_LIVE) {
        this.timer = 0;
        this.world.removeExplosion(this);
      }
    }
  }

  /**
   * Start the explosion.
   */
  start() {
    this.isStarted = true;
  }
}

export default Explosion;
