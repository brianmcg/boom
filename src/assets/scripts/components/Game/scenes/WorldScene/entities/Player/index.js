import {
  DEG,
  castRay,
  distanceBetween,
  isBodyCollision,
  isRayCollision,
} from 'game/core/physics';
import AbstractActor from '../AbstractActor';
import Item from '../Item';
import Weapon from './components/Weapon';
import Camera from './components/Camera';

const DEG_360 = DEG[360];

const DEG_45 = DEG[45];

const DEG_90 = DEG[90];

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
   * @param  {Array}  options.weapons         The player weapons data.
   * @param  {Camera} options.camera          The player camera.
   */
  constructor(options = {}) {
    const {
      maxVelocity,
      maxRotVelocity,
      acceleration,
      rotAcceleration,
      weapons,
      camera,
      ...other
    } = options;

    super(other);

    this.maxVelocity = maxVelocity;
    this.baseMaxVelocity = maxVelocity;
    this.maxRotVelocity = maxRotVelocity;
    this.acceleration = acceleration;
    this.rotAcceleration = rotAcceleration;
    this.maxHeight = this.height;
    this.minHeight = this.height * 0.6;
    this.heightVelocity = 2;
    this.currentWeaponType = Weapon.TYPES.PISTOL;
    this.actions = {};

    this.camera = new Camera({ player: this, ...camera });

    this.weapons = Object.keys(weapons).reduce((memo, type) => ({
      ...memo,
      [type]: new Weapon({
        player: this,
        ...weapons[type],
      }),
    }), {});
  }

  /**
   * Update the player.
   * @param  {Number} delta The delta time value.
   */
  update(delta) {
    this.updateMovement(delta);
    this.updateHeight(delta);
    this.updateWeapon(delta);
    this.updateCamera(delta);
    this.updateInteractions();
  }

  /**
   * Update player movement.
   * @param  {Number delta The delta time.
   */
  updateMovement(delta) {
    this.maxVelocity = this.baseMaxVelocity * this.height / this.maxHeight;

    if (this.actions.strafe) {
      this.updateStrafingMovement(delta);
    } else {
      this.updateStandardMovement(delta);
    }
  }

  /**
   * Update player standard movement.
   * @param  {Number delta The delta time.
   */
  updateStandardMovement(delta) {
    const {
      moveBackward,
      moveForward,
      turnLeft,
      turnRight,
    } = this.actions;

    if (moveForward) {
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
    } else if (moveBackward) {
      this.velocity = Math.max(this.velocity - this.acceleration, this.maxVelocity * -1);
    } else {
      this.velocity = Math.max(0, this.velocity - this.acceleration);
    }

    if (turnLeft) {
      this.rotVelocity = Math.max(
        this.rotVelocity - this.rotAcceleration, this.maxRotVelocity * -1,
      );
    } else if (turnRight) {
      this.rotVelocity = Math.min(this.rotVelocity + this.rotAcceleration, this.maxRotVelocity);
    } else {
      this.rotVelocity = 0;
    }

    super.update(delta);
  }

  /**
   * Update player strafing movement.
   * @param  {Number delta The delta time.
   */
  updateStrafingMovement(delta) {
    const previousAngle = this.angle;

    const {
      moveBackward,
      moveForward,
      turnLeft,
      turnRight,
    } = this.actions;

    this.rotVelocity = 0;

    if (moveForward && turnLeft) {
      this.angle = (previousAngle - DEG_45 + DEG_360) % DEG_360;
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
    } else if (moveForward && turnRight) {
      this.angle = (previousAngle + DEG_45) % DEG_360;
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
    } else if (!moveForward && !moveBackward && turnLeft) {
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
      this.angle = (previousAngle - DEG_90 + DEG_360) % DEG_360;
    } else if (!moveForward && !moveBackward && turnRight) {
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
      this.angle = (previousAngle + DEG_90) % DEG_360;
    } else if (moveBackward && turnLeft) {
      this.velocity = Math.max(this.velocity - this.acceleration, this.maxVelocity * -1);
      this.angle = (previousAngle + DEG_45) % DEG_360;
    } else if (moveBackward && turnRight) {
      this.angle = (previousAngle - DEG_45 + DEG_360) % DEG_360;
      this.velocity = Math.max(this.velocity - this.acceleration, this.maxVelocity * -1);
    } else if (moveForward) {
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
    } else if (moveBackward) {
      this.velocity = Math.max(this.velocity - this.acceleration, this.maxVelocity * -1);
    } else {
      this.velocity = 0;
    }

    super.update(delta);

    this.angle = previousAngle;
  }

  /**
   * Update player height.
   * @param  {Number delta The delta time.
   */
  updateHeight(delta) {
    if (this.actions.crouch) {
      this.height = Math.max(
        this.height - (this.heightVelocity * delta),
        this.minHeight,
      );
    } else {
      this.height = Math.min(
        this.height + (this.heightVelocity * delta),
        this.maxHeight,
      );
    }
  }

  /**
   * Update player weapon.
   * @param  {Number delta The delta time.
   */
  updateWeapon(delta) {
    const {
      armChaingun,
      armPistol,
      armShotgun,
      attack,
    } = this.actions;

    if (armChaingun) {
      this.selectNextWeapon(Weapon.TYPES.CHAINGUN);
    } else if (armPistol) {
      this.selectNextWeapon(Weapon.TYPES.PISTOL);
    } else if (armShotgun) {
      this.selectNextWeapon(Weapon.TYPES.SHOTGUN);
    } else if (attack) {
      this.useWeapon();
    }

    this.weapon.update(delta);
  }

  /**
   * Update player interactions.
   */
  updateInteractions() {
    this.world.getAdjacentBodies(this).forEach((body) => {
      if (body instanceof Item && isBodyCollision(this, body)) {
        this.pickUp(body);
      } else if (this.actions.use && body.use) {
        body.use();
      }
    });
  }

  /**
   * Update player camera.
   * @param  {Number delta The delta time.
   */
  updateCamera(delta) {
    this.camera.update(delta);
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
   * Use the current weapon.
   */
  useWeapon() {
    if (this.weapon.use()) {
      this.camera.setRecoil(this.weapon.recoil);
      this.world.setGunFlash(this.weapon.power);
      this.attack();
    }
  }

  /**
   * Attack in facing direction.
   */
  attack() {
    const { startPoint, endPoint } = castRay({ caster: this });
    const { enemies } = this.world;
    const { power, range } = this.weapon;

    const collisions = enemies.reduce((memo, enemy) => {
      if (!enemy.isDead() && isRayCollision(startPoint, endPoint, enemy)) return [...memo, enemy];
      return memo;
    }, []).sort((enemyA, enemyB) => {
      if (enemyA.distanceToPlayer > enemyB.distanceToPlayer) return 1;
      if (enemyA.distanceToPlayer < enemyB.distanceToPlayer) return -1;
      return 0;
    });

    [...Array(range)].forEach((_, i) => collisions[i] && collisions[i].hit(power));
  }

  /**
   * Pick up an item.
   * @param  {Item} item The item to pick up.
   */
  pickUp(item) {
    this.world.setItemFlash();
    this.world.remove(item);
    item.found = true;

    switch (item.key) {
      case Item.TYPES.AMMO:
        this.pickUpAmmo(item.value);
        break;
      case Item.TYPES.HEALTH:
        this.pickUpHealth(item.value);
        break;
      case Item.TYPES.KEY:
        this.pickUpKey(item.value);
        break;
      case Item.TYPES.WEAPON:
        this.pickUpWeapon(item.value);
        break;
      default:
        break;
    }
  }

  /**
   * Pick up ammo.
   * @param  {Number} amount The amount of ammo.
   */
  pickUpAmmo(amount) {
    this.pickup = amount;
  }

  /**
   * Pick up health.
   * @param  {Number} amount The amount of health.
   * @return {[type]}       [description]
   */
  pickUpHealth(amount) {
    this.pickup = amount;
  }

  /**
   * Pick up key.
   * @param  {String} type The type of key.
   */
  pickUpKey(type) {
    this.pickup = type;
  }

  /**
   * Pick up a weapon
   * @param  {String} type  the type of weapon.
   */
  pickUpWeapon(type) {
    this.pickup = type;
  }

  /**
   * Set the player actions.
   * @param {Object} actions The player actions.
   */
  setActions(actions = {}) {
    this.actions = actions;
  }

  /**
   * Shake the player.
   * @param  {Number} amount The amount to shake.
   */
  shake(amount) {
    this.camera.setShake(amount);
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
   * Get the view angle on the y axis.
   * @return {Number} The view angle.
   */
  get viewAngleY() {
    return this.camera.rotationY;
  }

  /**
   * Get the view angle on the x axis.
   * @return {Number} The view angle.
   */
  get viewAngleX() {
    return (this.angle + this.camera.rotationX + DEG_360) % DEG_360;
  }
}

export { Weapon };

export default Player;
