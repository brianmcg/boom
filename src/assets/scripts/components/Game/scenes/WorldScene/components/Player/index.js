import Character from '../Character';
import { TILE_SIZE } from '~/constants/config';
import { DEG } from '~/core/physics';

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
  /* Creates a player.
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
   * @param  {World}  world The world that contains the body.
   */
  update(delta, world) {
    const {
      isMovingForward,
      isMovingBackward,
      isTurningLeft,
      isTurningRight,
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

    super.update(delta, world);

    Object.keys(this.actions).forEach((key) => {
      this.actions[key] = false;
    });
  }
}
