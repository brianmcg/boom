import { CELL_SIZE } from 'game/constants/config';
import DynamicEntity from '../DynamicEntity';

const STATES = {
  IDLE: 'projectile:idle',
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

    this.source = source;
    this.speed = speed * CELL_SIZE;
    this.explosionType = explosionType;

    this.onCollision((body) => {
      if (body.blocking) {
        const damage = this.source.attackDamage();

        if (this.setColliding()) {
          this.parent.addExplosion({
            sourceId: this.id,
            x: this.x,
            y: this.y,
            type: this.explosionType,
            parent: this.parent,
            flash: damage * 0.75,
            shake: damage * 0.75,
          });
        }

        if (body.hurt) {
          body.hurt(damage);
        }
      }
    });

    this.setIdle();
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
    this.remove();
    this.source.projectiles.push(this);

    this.setIdle();
  }

  /**
   * Initialize the projectile.
   */
  initialize() {
    super.initialize();
    this.emitSound(this.sounds.travel);
  }

  /**
   * Set the projectile properties.
   * @param {Number} options.x     The x coordinate.
   * @param {Number} options.y     The y coordinate.
   * @param {Number} options.angle The angle.
   * @param {Number} options.width The width.
   */
  setProperties({ x = 0, y = 0, angle = 0 }) {
    this.angle = angle;
    this.x = x;
    this.y = y;
    this.velocity = this.speed;

    this.setTravelling();
  }

  /**
   * Set the projectile to the travelling state.
   * @return {Boolean} State change successfull.
   */
  setTravelling() {
    return this.setState(STATES.TRAVELLING);
  }

  /**
   * Set the projectile to the idle state.
   * @return {Boolean} State change successfull.
   */
  setIdle() {
    return this.setState(STATES.IDLE);
  }

  /**
   * Set the projectile to the exploding state.
   * @return {Boolean} State change successfull.
   */
  setColliding() {
    const isStateChanged = this.setState(STATES.EXPLODING);

    if (isStateChanged) {
      this.velocity = 0;
      this.stop();
      this.emitSound(this.sounds.explode);
    }

    return isStateChanged;
  }
}

export default Projectile;
