import { TILE_SIZE } from '~/constants/config';
import AbstractActor from '../AbstractActor';
import Item from '../Item';
import Weapon from '../Weapon';
import Camera from './components/Camera';

const DEFAULTS = {
  MAX_VELOCITY: TILE_SIZE / 14,
  MAX_ROTATION_VELOCITY: 12,
  ACCELERATION: TILE_SIZE / 256,
  ROTATION_ACCELERATION: 2,
};

const WEAPON_DEFAULTS = {
  [Weapon.TYPES.PISTOL]: {
    idleTime: 200,
    power: 4,
    equiped: true,
  },
  [Weapon.TYPES.SHOTGUN]: {
    idleTime: 750,
    power: 16,
    equiped: true,
  },
  [Weapon.TYPES.CHAINGUN]: {
    idleTime: 0,
    power: 8,
    equiped: true,
  },
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
    this.minHeight = this.height * 0.6;
    this.heightVelocity = 2;
    this.currentWeaponType = Weapon.TYPES.PISTOL;
    this.actions = {};
    this.camera = new Camera(this);

    this.weapons = Object.values(Weapon.TYPES).reduce((memo, type) => ({
      ...memo,
      [type]: new Weapon({ player: this, ...WEAPON_DEFAULTS[type] }),
    }), {});
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

    // Update height
    if (crouch) {
      this.height = Math.max(this.height - this.heightVelocity, this.minHeight);
    } else {
      this.height = Math.min(this.height + this.heightVelocity, this.maxHeight);
    }

    // Update weapon
    if (armChaingun) {
      this.selectNextWeapon(Weapon.TYPES.CHAINGUN);
    } else if (armPistol) {
      this.selectNextWeapon(Weapon.TYPES.PISTOL);
    } else if (armShotgun) {
      this.selectNextWeapon(Weapon.TYPES.SHOTGUN);
    } else if (continueAttack) {
      this.weapon.use();
    }

    this.weapon.update(delta);
    this.camera.update(delta);

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

  /**
   * Select the next weapon to use.
   * @param  {String} type The type of weapon to use.
   */
  selectNextWeapon(type) {
    if (this.currentWeaponType !== type) {
      this.nextWeaponType = type;
      this.weapon.setUnarming();
    }
  }

  /**
   * Arm the next selected weapon.
   */
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

  /**
   * Pick up ammo.
   * @param  {Number} amount The amount of ammo.
   */
  pickUpAmmo(amount) {
    console.log('pickUpAmmo', amount);
    this.foo = true;
  }

  /**
   * Pick up health.
   * @param  {Number} amount The amount of health.
   * @return {[type]}       [description]
   */
  pickUpHealth(amount) {
    console.log('pickUpHealth', amount);
    this.foo = true;
  }

  /**
   * Pick up key.
   * @param  {String} type The type of key.
   */
  pickUpKey(type) {
    console.log('pickUpKey', type);
    this.foo = true;
  }

  /**
   * Pick up a weapon
   * @param  {String} type  the type of weapon.
   */
  pickUpWeapon(value) {
    console.log('pickUpWeapon', value);
    this.foo = true;
  }

  /**
   * Set the player actions.
   * @param {Object} actions The player actions.
   */
  setActions(actions = {}) {
    this.actions = actions;
  }

  /**
   * Get the player weapon.
   * @return {Weapon} The player weapon.
   */
  get weapon() {
    return this.weapons[this.currentWeaponType];
  }

  /**
   * Get the camera height.
   * @return {Number} The camera height.
   */
  get cameraHeight() {
    return this.height + this.camera.height;
  }

  /**
   * Get the camera rotation.
   * @return {Number} The camera rotation.
   */
  get cameraRotation() {
    return this.camera.rotation;
  }
}

export default Player;
