import { TILE_SIZE } from '~/constants/config';
import { DEG } from '~/core/physics';
import AbstractActor from '../AbstractActor';
import Item from '../Item';
import Weapon from '../Weapon';

const WEAPON_NAMES = ['pistol', 'double_shotgun', 'chaingun'];

const EYE_HEIGHT_INCREMENT = 0.04;

const MAX_EYE_HEIGHT_OFFSET = 2;

const DEFAULTS = {
  MAX_VELOCITY: TILE_SIZE / 16,
  MAX_ROTATION_VELOCITY: DEG[2],
  ACCELERATION: TILE_SIZE / 256,
  ROTATION_ACCELERATION: 2,
  MAX_EYE_ROTATION_VELOCITY: 128,
  EYE_ROTATION_VELOCITY: 4,
};

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
      maxRotVelocity = DEFAULTS.MAX_ROTATION_VELOCITY,
      acceleration = DEFAULTS.ACCELERATION,
      rotAcceleration = DEFAULTS.ROTATION_ACCELERATION,
      ...other
    } = options;

    super(other);

    this.maxVelocity = maxVelocity;
    this.maxRotVelocity = maxRotVelocity;
    this.acceleration = acceleration;
    this.rotAcceleration = rotAcceleration;

    this.maxHeight = this.height;
    this.minHeight = this.height / 3 * 2;
    this.heightVelocity = 2;

    this.eyeHeightOffset = 0;
    this.eyeHeightOffsetDirection = 1;

    this.eyeRotation = 0;
    this.eyeRotationVelocity = DEFAULTS.EYE_ROTATION_VELOCITY;
    this.maxEyeRotationVelocity = DEFAULTS.MAX_EYE_ROTATION_VELOCITY;

    this.currentWeaponIndex = 0;

    this.actions = {};

    this.weapons = WEAPON_NAMES.map(type => new Weapon({
      type,
      player: this,
    }));

    this.weapons.forEach((weapon) => {
      weapon.on(Weapon.EVENTS.FIRE, (power) => {
        this.eyeRotation += power;
      });
    });
  }

  /**
   * Set the player actions.
   * @param {Object} actions The player actions.
   */
  setActions(actions = {}) {
    this.actions = actions;
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
      this.eyeRotation = Math.max(
        this.eyeRotation - this.eyeRotationVelocity,
        -this.maxEyeRotationVelocity,
      );
    } else if (lookUp) {
      this.eyeRotation = Math.min(
        this.eyeRotation + this.eyeRotationVelocity,
        this.maxEyeRotationVelocity,
      );
    } else if (this.eyeRotation < 0) {
      this.eyeRotation = Math.min(this.eyeRotation + this.eyeRotationVelocity, 0);
    } else if (this.eyeRotation > 0) {
      this.eyeRotation = Math.max(this.eyeRotation - this.eyeRotationVelocity, 0);
    }

    // Update height
    if (crouch) {
      this.height = Math.max(this.height - this.heightVelocity, this.minHeight);
    } else {
      this.height = Math.min(this.height + this.heightVelocity, this.maxHeight);
    }

    if (this.velocity) {
      if (this.eyeHeightOffsetDirection > 0) {
        this.eyeHeightOffset = Math.min(
          this.eyeHeightOffset + EYE_HEIGHT_INCREMENT * Math.abs(this.velocity) * delta,
          MAX_EYE_HEIGHT_OFFSET,
        );
      } else if (this.eyeHeightOffsetDirection < 0) {
        this.eyeHeightOffset = Math.max(
          this.eyeHeightOffset - EYE_HEIGHT_INCREMENT * Math.abs(this.velocity) * delta * 2,
          -MAX_EYE_HEIGHT_OFFSET,
        );
      }

      if (Math.abs(this.eyeHeightOffset) === MAX_EYE_HEIGHT_OFFSET) {
        this.eyeHeightOffsetDirection *= -1;
      }
    } else if (this.eyeHeightOffset > 0) {
      this.eyeHeightOffset = Math.max(
        this.eyeHeightOffset - EYE_HEIGHT_INCREMENT * this.maxVelocity * delta,
        0,
      );
    } else if (this.eyeHeightOffset < 0) {
      this.eyeHeightOffset = Math.min(
        this.eyeHeightOffset + EYE_HEIGHT_INCREMENT * this.maxVelocity * delta,
        0,
      );
    }

    // Check interactive bodies
    this.world.getAdjacentBodies(this).forEach((body) => {
      if (body instanceof Item && this.collide(body)) {
        this.pickUp(body);
      } else if (use && body.use) {
        body.use();
      }
    });

    this.weapon.update(delta);

    // Update parent
    super.update(delta);
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

  get eyeHeight() {
    return this.height + this.eyeHeightOffset;
  }
}

export default Player;
