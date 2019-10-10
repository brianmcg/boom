import AbstractActor from '../AbstractActor';
import Item from '../Item';
import Weapon from '../Weapon';
import { DEFAULTS } from './constants';

/**
 * Creates a player.
 * @extends {AbstractActor}
 */
class Player extends AbstractActor {
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

    this.maxHeight = this.height;
    this.minHeight = this.height / 2;
    this.heightVelocity = 2;

    this.zAxis = 0;
    this.velocityZ = DEFAULTS.Y_ROT_VELOCITY;
    this.maxVelocityZ = DEFAULTS.MAX_Y_ANGLE;

    this.currentWeaponIndex = 0;

    this.weapons = [new Weapon({ type: 'pistol' })];
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
      lookDown,
      lookUp,
      crouch,
      use,
    } = this.actions;

    // Update velocity
    this.maxVelocity = DEFAULTS.MAX_VELOCITY * this.height / this.maxHeight;

    if (moveForward) {
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
    } else if (moveBackward) {
      this.velocity = Math.max(this.velocity - this.acceleration, this.maxVelocity * -1);
    } else {
      this.velocity = Math.max(0, this.velocity - this.acceleration);
    }

    // Update rotation velocity
    if (turnLeft) {
      this.rotVelocity = Math.max(
        this.rotVelocity - this.rotAcceleration, this.maxRotVelocity * -1,
      );
    } else if (turnRight) {
      this.rotVelocity = Math.min(this.rotVelocity + this.rotAcceleration, this.maxRotVelocity);
    } else {
      this.rotVelocity = 0;
    }

    // Update y axis rotation
    if (lookDown) {
      this.zAxis = Math.max(this.zAxis - this.velocityZ, -this.maxVelocityZ);
    } else if (lookUp) {
      this.zAxis = Math.min(this.zAxis + this.velocityZ, this.maxVelocityZ);
    } else if (this.zAxis < 0) {
      this.zAxis = Math.min(this.zAxis + this.velocityZ, 0);
    } else if (this.zAxis > 0) {
      this.zAxis = Math.max(this.zAxis - this.velocityZ, 0);
    }

    // Update height
    if (crouch) {
      this.height = Math.max(this.height - this.heightVelocity, this.minHeight);
    } else {
      this.height = Math.min(this.height + this.heightVelocity, this.maxHeight);
    }

    // Check interactive bodies
    this.world.getAdjacentBodies(this).forEach((body) => {
      if (body instanceof Item && this.collide(body)) {
        this.pickUp(body);
      } else if (use && body.use) {
        body.use();
      }
    });

    // Update parent
    super.update(delta);

    // Reset actions
    Object.keys(this.actions).forEach((key) => {
      this.actions[key] = false;
    });
  }

  /**
   * Pick up an item.
   * @param  {Item} item The item to pick up.
   */
  pickUp(item) {
    this.world.remove(item);

    // TODO: Add value;
    // if (item instanceof Weapon) {
    //   console.log('picked up weapon');
    // }
  }

  get weapon() {
    return this.weapons[this.currentWeaponIndex];
  }
}

export default Player;