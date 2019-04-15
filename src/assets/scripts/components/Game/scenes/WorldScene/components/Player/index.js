import Character from '../Character';
import Item from '../Item';
import { DEFAULTS } from './constants';

const { min, max } = Math;

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
   * Update the player.
   * @param  {Number} delta The delta time value.
   */
  update(delta) {
    const {
      moveForward,
      moveBackward,
      turnLeft,
      turnRight,
      use,
    } = this.actions;

    if (moveForward) {
      this.velocity = min(this.velocity + this.acceleration, this.maxVelocity);
    } else if (moveBackward) {
      this.velocity = max(this.velocity - this.acceleration, this.maxVelocity * -1);
    } else {
      this.velocity = max(0, this.velocity - this.acceleration);
    }

    if (turnLeft) {
      this.rotVelocity = max(this.rotVelocity - this.rotAcceleration, this.maxRotVelocity * -1);
    } else if (turnRight) {
      this.rotVelocity = min(this.rotVelocity + this.rotAcceleration, this.maxRotVelocity);
    } else {
      this.rotVelocity = 0;
    }

    this.world.adjacentBodies(this).forEach((body) => {
      if (body instanceof Item && this.collide(body)) {
        this.pickup(body);
      } else if (use && body.use) {
        body.use();
      }
    });

    super.update(delta);

    Object.keys(this.actions).forEach((key) => {
      this.actions[key] = false;
    });
  }

  /**
   * Pick up an item.
   * @param  {Item} item The item to pick up.
   */
  pickup(item) {
    this.world.remove(item);
    // TODO: Add value;
    this.item = null;
  }
}
