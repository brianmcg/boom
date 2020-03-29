import { CELL_SIZE } from 'game/constants/config';
import { COS, SIN } from 'game/core/physics';
import DynamicEntity from '../DynamicEntity';

const STATES = {
  TRAVELLING: 'projectile:travelling',
  EXPLODING: 'projectile:exploding',
};

const EXPLODE_EVENT = 'projectile:explode:event';

/**
 * Class representing a projectile
 */
class Projectile extends DynamicEntity {
  /**
   * Creates a projectile.
   * @param  {Number}           options.x         The x coordinate of the projectile.
   * @param  {Number}           options.y         The y coordinate of the projectile
   * @param  {Number}           options.width     The width of the projectile.
   * @param  {Number}           options.length    The length of the projectile.
   * @param  {Number}           options.height    The height of the projectile.
   * @param  {Number}           options.angle     The angle of the projectile.
   * @param  {Boolean}          options.blocking  Is the projectile blocking.
   * @param  {String}           options.texture   The texture of projectile.
   * @param  {String}           options.sounds    The sounds of projectile.
   * @param  {Number}           options.power     The power of the projectile.
   * @param  {Number}           options.speed     The speed of the projectile.
   * @param  {String}           options.type      The type of projectile.
   * @param  {ProjectileEnemy}  options.source    The source of the projectile.
   */
  constructor({
    width = CELL_SIZE / 4,
    length = CELL_SIZE / 4,
    height = CELL_SIZE / 4,
    power = 0,
    speed = 0,
    type,
    source,
    ...other
  }) {
    super({
      width,
      length,
      height,
      blocking: false,
      ...other,
    });

    this.type = type;
    this.power = power;
    this.source = source;
    this.speed = speed;

    this.onCollisionEvent((body) => {
      this.world.stop(this);
      this.setExploding();

      if (body.isActor) {
        body.hurt(this.power);
      }
    });
  }

  /**
   * Initialize the projectile.
   */
  initialize() {
    const {
      x,
      y,
      angle,
      width,
    } = this.source;

    this.angle = angle;
    this.velocity = this.speed;
    this.x = x + COS[angle] * width;
    this.y = y + SIN[angle] * width;
  }

  /**
   * Add a callback for the explode event.
   * @param  {Function} callback The callback function.
   */
  onExplode(callback) {
    this.on(EXPLODE_EVENT, callback);
  }

  /**
   * Set the projectile to the travelling state.
   * @return {Boolean} State change successfull.
   */
  setTravelling() {
    return this.setState(STATES.TRAVELLING);
  }

  /**
   * Set the projectile to the exploding state.
   * @return {Boolean} State change successfull.
   */
  setExploding() {
    const stateChanged = this.setState(STATES.EXPLODING);

    if (stateChanged) {
      this.velocity = 0;
      this.emit(EXPLODE_EVENT);
    }

    return stateChanged;
  }
}

export default Projectile;
