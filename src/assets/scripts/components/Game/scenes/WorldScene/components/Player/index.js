import Character from '../Character';
import { TILE_SIZE } from '~/constants/config';
import { DEG } from '~/core/physics';
import Item from '../Item';

const { min, max } = Math;

const DEFAULTS = {
  MAX_VELOCITY: TILE_SIZE / 16,
  MAX_ROT_VELOCITY: DEG[2],
  ACCELERATION: TILE_SIZE / 256,
  ROT_ACCELERATION: 2,
};

/**
 * Creates a player.
 * @extends {Character}
 */
export default class Player extends Character {
  /**
   *  Creates a player.
   * @param  {Number} options.x               The x coordinate of the player.
   * @param  {Number} options.y               The y coordinate of the player
   * @param  {Number} options.width           The width of the player.
   * @param  {Number} options.length          The length of the player.
   * @param  {Number} options.height          The height of the player.
   * @param  {Number} options.angle           The angle of the player.
   * @param  {Number} options.maxHealth       The maximum health of the player.
   * @param  {Number} options.maxVelocity     The maximum velocity of the player.
   * @param  {Number} options.maxRotVelocity  The maximum rotation velocity of the player.
   * @param  {Number} options.acceleration    The acceleration of the player.
   * @param  {Number} options.rotAcceleration The rotation acceleration of the player.
   */
  constructor(options = {}) {
    const {
      maxVelocity = DEFAULTS.MAX_VELOCITY,
      maxRotVelocity = DEFAULTS.MAX_ROT_VELOCITY,
      acceleration = DEFAULTS.ACCELERATION,
      rotAcceleration = DEFAULTS.ROT_ACCELERATION,
      ...other
    } = options;

    super(other);

    this.maxVelocity = maxVelocity;
    this.maxRotVelocity = maxRotVelocity;
    this.acceleration = acceleration;
    this.rotAcceleration = rotAcceleration;
  }

  /**
   * Update the dynamic body.
   * @param  {Number} delta The delta time value.
   */
  update(delta) {
    const {
      isMovingForward,
      isMovingBackward,
      isTurningLeft,
      isTurningRight,
      isUsing,
    } = this.actions;

    if (isMovingForward) {
      this.velocity = min(this.velocity + this.acceleration, this.maxVelocity);
    } else if (isMovingBackward) {
      this.velocity = max(this.velocity - this.acceleration, this.maxVelocity * -1);
    } else {
      this.velocity = max(0, this.velocity - this.acceleration);
    }

    if (isTurningLeft) {
      this.rotVelocity = max(this.rotVelocity - this.rotAcceleration, this.maxRotVelocity * -1);
    } else if (isTurningRight) {
      this.rotVelocity = min(this.rotVelocity + this.rotAcceleration, this.maxRotVelocity);
    } else {
      this.rotVelocity = 0;
    }

    this.world.adjacentBodies(this).forEach((body) => {
      if (body instanceof Item && this.collide(body)) {
        this.pickup(body);
      } else if (isUsing && body.use) {
        body.use();
      }
    });

    super.update(delta);

    if (this.world.sector(this.gridX, this.gridY).exit) {
      this.world.emit('complete', this);
    }

    Object.keys(this.actions).forEach((key) => {
      this.actions[key] = false;
    });
  }

  pickup(item) {
    this.world.remove(item);
    // TODO: Add value;
    this.item = null;
  }
}
