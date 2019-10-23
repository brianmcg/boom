import { TILE_SIZE } from '~/constants/config';
import AbstractActor from '../AbstractActor';
import Item from '../Item';
import Weapon from '../Weapon';

const EYE_HEIGHT_INCREMENT = 0.04;

const MAX_EYE_HEIGHT_OFFSET = 2;

const DEFAULTS = {
  MAX_VELOCITY: TILE_SIZE / 14,
  MAX_ROTATION_VELOCITY: 12,
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

    this.currentWeaponType = Weapon.TYPES.PISTOL;

    this.actions = {};

    this.weapons = Object.values(Weapon.TYPES).reduce((memo, type) => ({
      ...memo,
      [type]: new Weapon({
        type,
        player: this,
      }),
    }), {});
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
      armChaingun,
      armPistol,
      armShotgun,
      continueAttack,
      crouch,
      lookDown,
      lookUp,
      moveBackward,
      moveForward,
      turnLeft,
      turnRight,
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

    const { CHAINGUN, PISTOL, SHOTGUN } = Weapon.TYPES;

    if (armChaingun) {
      if (this.currentWeaponType !== CHAINGUN) {
        this.nextWeaponType = CHAINGUN;
        this.weapon.setUnarming();
      }
    } else if (armPistol) {
      if (this.currentWeaponType !== PISTOL) {
        this.nextWeaponType = PISTOL;
        this.weapon.setUnarming();
      }
    } else if (armShotgun) {
      if (this.currentWeaponType !== SHOTGUN) {
        this.nextWeaponType = SHOTGUN;
        this.weapon.setUnarming();
      }
    } else if (continueAttack) {
      this.weapon.use();
    }

    this.weapon.update(delta);

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
  }

  armNextWeapon() {
    this.currentWeaponType = this.nextWeaponType;
    this.weapon.setArming();
  }

  /**
   * Pick up an item.
   * @param  {Item} item The item to pick up.
   */
  pickUp(item) {
    switch (item.key) {
      case Item.TYPES.AMMO: this.pickUpAmmo(item.value); break;
      case Item.TYPES.HEALTH: this.pickUpHealth(item.value); break;
      case Item.TYPES.KEY: this.pickUpKey(item.value); break;
      case Item.TYPES.WEAPON: this.pickUpWeapon(item.value); break;
      default: break;
    }

    this.world.remove(item);
  }

  pickUpAmmo(value) {
    console.log('pickUpAmmo', value);
    this.foo = true;
  }

  pickUpHealth(value) {
    console.log('pickUpHealth', value);
    this.foo = true;
  }

  pickUpKey(value) {
    console.log('pickUpKey', value);
    this.foo = true;
  }

  pickUpWeapon(value) {
    console.log('pickUpWeapon', value);
    this.foo = true;
  }

  get weapon() {
    return this.weapons[this.currentWeaponType];
  }

  get eyeHeight() {
    return this.height + this.eyeHeightOffset;
  }
}

export default Player;
