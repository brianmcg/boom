import { Body, degrees } from '@game/core/physics';
import { CELL_SIZE } from '@constants/config';
import DynamicEntity from './DynamicEntity';
import Explosion from './Explosion';

const STATES = {
  IDLE: 'projectile:idle',
  TRAVELLING: 'projectile:travelling',
  COLLIDING: 'projectile:colliding',
};

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

/**
 * Class representing a projectile
 * @extends {DynamicEntity}
 */
export default class Projectile extends DynamicEntity {
  /**
   * Creates a projectile.
   * @param  {Number}         options.x          The x coordinate of the projectile.
   * @param  {Number}         options.y          The y coordinate of the projectile.
   * @param  {Number}         options.z          The z coordinate of the projectile.
   * @param  {Number}         options.width      The width of the projectile.
   * @param  {Number}         options.height     The length of the projectile.
   * @param  {Number}         options.height     The height of the projectile.
   * @param  {Boolean}        options.blocking   The blocking value of the projectile.
   * @param  {Number}         options.anchor     The anchor of the projectile.
   * @param  {Number}         options.angle      The angle of the projectile.
   * @param  {Number}         options.weight     The weight of the projectile.
   * @param  {Number}         options.autoPlay   The autopPlay value of the projectile.
   * @param  {String}         options.name       The name of the projectile.
   * @param  {Object}         options.sounds     The projectile sounds.
   * @param  {Object}         soundSprite        The projectile sound sprite.
   * @param  {Number}         options.scale      The projectile scale.
   * @param  {Object}         options.tail       The projectile tail.
   * @param  {Number}         options.speed      The speed of the projectile.
   * @param  {DynamicEntity}  options.source     The source of the projectile.
   * @param  {Object}         options.effects    The effects of the projectile.
   * @param  {Array}          options.queue      The queue that holds the projectile.
   * @param  {Object}         options.explosion  The projectile explosion options.
   * @param  {Number}         options.elavation  The elavation of the projectile.
   */
  constructor({
    width = CELL_SIZE / 4,
    height = CELL_SIZE / 4,
    length = CELL_SIZE / 4,
    speed = 0,
    source,
    effects,
    weight = 0,
    queue,
    explosion,
    elavation = 0,
    ...other
  }) {
    super({
      width,
      height,
      length,
      blocking: false,
      weight,
      ...other,
    });

    this.source = source;
    this.effects = effects;
    this.velocity = speed * CELL_SIZE;
    this.queue = queue;
    this.baseElavation = elavation * CELL_SIZE;

    this.timer = 0;

    if (explosion) {
      this.explosion = new Explosion({ source: this, ...explosion });
    }

    this.addTrackedCollision({
      type: Body,
      onStart: body => this.handleCollision(body),
    });

    this.setIdle();
  }

  /**
   * Initialize the projectile.
   */
  onAdded(parent) {
    super.onAdded(parent);

    const { x, y } = this.source;
    const cell = parent.getCell(this.gridX, this.gridY);

    if (cell.blocking && this.isBodyCollision(cell)) {
      this.x = x;
      this.y = y;
    }

    this.setTravelling();
    this.emitSound(this.sounds.travel);
  }

  /**
   * Handle a collision event.
   * @param  {Body} body The body the projectile has collided with.
   */
  handleCollision(body) {
    if (body.blocking && this.setColliding() && !body.edge) {
      if (body.isDestroyable) {
        const angle = (body.getAngleTo(this) + DEG_180) % DEG_360;

        body.hit({ damage: this.damage, angle });
      }

      if (this.explosion) {
        this.explosion.run();
      }
    }
  }

  /**
   * Update the projectile.
   * @param  {Number} delta     The delta time.
   * @param  {Number} elapsedMS The elapsed time in milliseconds.
   */
  update(delta, elapsedMS) {
    switch (this.state) {
      case STATES.TRAVELLING:
        this.updateTravalling(delta, elapsedMS);
        break;
      case STATES.EXPLODING:
        this.updateColliding();
        break;
      default:
        break;
    }
  }

  /**
   * Update the projectile in the travelling state.
   * @param  {Number} delta     The delta time.
   * @param  {Number} elapsedMS The elapsed time in milliseconds.
   */
  updateTravalling(delta, elapsedMS) {
    super.update(delta, elapsedMS);
  }

  /**
   * Update the projectile in the exploding state.
   */
  updateColliding() {
    this.remove();
    this.queue.push(this);
    this.setIdle();
  }

  /**
   * Set the projectile damage and angle properties.
   * @param {Number} options.angle  The angle of the projectile.
   * @param {Number} options.damage The damage the projectile inflicts.
   * @param {Number} options.offset The offset of the projectile.
   */
  set({ angle = 0, damage = 0, offset = 0 }) {
    const { x, y, elavation, elavationOffset = 0, width } = this.source;

    const distance = Math.sqrt(width * width + width * width) + 1;

    this.x = x + Math.cos(angle + offset) * distance;
    this.y = y + Math.sin(angle + offset) * distance;
    this.z = this.baseElavation + elavation + elavationOffset;

    this.angle = angle;
    this.damage = damage;
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
      this.stop();

      if (this.sounds?.impact) {
        this.emitSound(this.sounds.impact);
      }
    }

    return isStateChanged;
  }
}
