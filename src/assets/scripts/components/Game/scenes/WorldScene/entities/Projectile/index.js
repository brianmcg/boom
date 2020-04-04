import { CELL_SIZE } from 'game/constants/config';
import { COS, SIN } from 'game/core/physics';
import DynamicEntity from '../DynamicEntity';
import Explosion from '../../effects/Explosion';

const STATES = {
  TRAVELLING: 'projectile:travelling',
  COLLIDING: 'projectile:colliding',
};

/**
 * Class representing a projectile
 */
class Projectile extends DynamicEntity {
  /**
   * Creates a projectile.
   * @param  {Number}           options.x         The x coordinate of the projectile.
   * @param  {Number}           options.y         The y coordinate of the projectile
   * @param  {Number}           options.width     The width of the projectile.
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
    height = CELL_SIZE / 4,
    power = 0,
    speed = 0,
    source,
    explosionType,
    ...other
  }) {
    super({
      width,
      height,
      blocking: false,
      ...other,
    });

    this.power = power;
    this.source = source;
    this.speed = speed;
    this.explosionType = explosionType;

    this.onCollisionEvent((body) => {
      this.setColliding();
      this.parent.onExplosion(this.power);
      this.parent.player.shake(this.power);

      if (body.isPlayer) {
        body.hurt(this.power);
      }
    });

    this.setTravelling();
  }

  /**
   * Update the projectile.
   * @param  {Number} delta The delta time.
   * @return {[type]}       [description]
   */
  update(delta) {
    switch (this.state) {
      case STATES.TRAVELLING:
        super.update(delta);
        break;
      case STATES.EXPLODING:
        this.updateColliding(delta);
        break;
      default:
        break;
    }
  }

  /**
   * Update the projectile in the exploding state.
   */
  updateColliding() {
    this.parent.remove(this);
    this.source.projectiles.push(this);

    this.parent.addExplosion(new Explosion({
      sourceId: this.id,
      x: this.x,
      y: this.y,
      type: this.explosionType,
      parent: this.parent,
    }));

    this.setTravelling();
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
  setColliding() {
    const stateChanged = this.setState(STATES.EXPLODING);

    if (stateChanged) {
      this.velocity = 0;
    }

    return stateChanged;
  }
}

export default Projectile;
