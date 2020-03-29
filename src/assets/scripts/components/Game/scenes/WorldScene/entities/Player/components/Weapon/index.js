import { TIME_STEP, CELL_SIZE } from 'game/constants/config';
import Entity from '../../../Entity';

const MAX_MOVE_X = 8;

const MAX_MOVE_Y = 6;

const MOVE_AMOUNT_X = 0.4;

const MOVE_AMOUNT_Y = 0.1;

const STATES = {
  FIRING: 'weapon:firing',
  ARMING: 'weapon:arming',
  UNARMING: 'weapon:unarming',
  UNARMED: 'weapon:unarmed',
  IDLE: 'weapon:idle',
  DISABLED: 'weapon:disabled',
};

const EVENTS = {
  ARMING: 'weapon:arming',
};

/**
 * Class representing a weapon.
 */
class Weapon extends Entity {
  /**
   * Creates a weapon.
   * @param  {Player}  options.player   The player.
   * @param  {Number}  options.power    The power of the weapon.
   * @param  {Boolean} options.equiped  Is the weapon equiped.
   * @param  {Number}  options.idleTime The time to wait in idle state after firing.
   * @param  {Number}  options.recoil   The recoil of the weapon.
   * @param  {Number}  options.maxAmmo  The max amount of ammo the weapon can hold.
   * @param  {Number}  options.range    The range of the weapon.
   * @param  {String}  options.texture  The weapon texture.
   */
  constructor({
    player,
    power,
    equiped,
    idleTime,
    recoil,
    maxAmmo,
    range,
    sounds,
    explosionType,
    ...other
  }) {
    super(other);

    this.explosionType = explosionType;
    this.sounds = sounds;
    this.idleTime = idleTime;
    this.power = power;
    this.equiped = equiped;
    this.player = player;
    this.offsetY = CELL_SIZE;
    this.recoil = recoil;
    this.ammo = maxAmmo / 2;
    this.maxAmmo = maxAmmo;
    this.range = [...Array(range)];

    this.offsetX = 0;
    this.offsetYDirection = 1;
    this.timer = 0;

    this.setUnarmed();
  }

  /**
   * Add a callback for the arming event.
   * @param  {Function} callback The callback function.
   */
  onArmingEvent(callback) {
    this.on(EVENTS.ARMING, callback);
  }

  /**
   * Use the weapon.
   */
  use() {
    if (this.isIdle() && this.ammo) {
      return this.setFiring();
    }

    return false;
  }

  /**
   * Set the weapon  equiped value.
   * @param {Boolean} value The boolean value.
   */
  setEquiped(value) {
    this.equiped = value;
  }

  /**
   * Is the weapon equiped.
   * @return {Boolean} The boolean value.
   */
  isEquiped() {
    return this.equiped;
  }

  /**
   * Add ammo to the weapon.
   * @param  {Number}  amount The amount of ammo to add.
   * @return {Boolean} Representing add ammo success.
   */
  addAmmo(amount = 0) {
    if (this.ammo < this.maxAmmo) {
      this.ammo += amount;

      if (this.ammo > this.maxAmmo) {
        this.ammo = this.maxAmmo;
      }

      return true;
    }

    return false;
  }

  /**
   * Update the weapon.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    switch (this.state) {
      case STATES.IDLE:
        this.updateIdle(delta);
        break;
      case STATES.DISABLED:
        this.updateDisabled(delta);
        break;
      case STATES.ARMING:
        this.updateArming(delta);
        break;
      case STATES.UNARMING:
        this.updateUnarming(delta);
        break;
      default:
        break;
    }
  }

  /**
   * Update the weapon when in an idle state.
   * @param  {Number} delta The delta time.
   */
  updateIdle(delta) {
    const { actions, velocity } = this.player;

    // Update x offset
    if (actions.turnLeft) {
      this.offsetX = Math.max(this.offsetX - MOVE_AMOUNT_X * delta, -MAX_MOVE_X);
    } else if (actions.turnRight) {
      this.offsetX = Math.min(this.offsetX + MOVE_AMOUNT_X * delta, MAX_MOVE_X);
    } else if (this.offsetX > 0) {
      this.offsetX = Math.max(this.offsetX - MOVE_AMOUNT_X * delta, 0);
    } else if (this.offsetX < 0) {
      this.offsetX = Math.min(this.offsetX + MOVE_AMOUNT_X * delta, 0);
    }

    // Update y offset
    if (velocity) {
      if (this.offsetYDirection > 0) {
        this.offsetY = Math.min(this.offsetY + MOVE_AMOUNT_Y * delta, MAX_MOVE_Y);
      } else if (this.offsetYDirection < 0) {
        this.offsetY = Math.max(this.offsetY - MOVE_AMOUNT_Y * delta, 0);
      }
    } else if (this.offsetY > 0) {
      this.offsetY = Math.max(this.offsetY - MOVE_AMOUNT_Y * delta, 0);
    }

    if (Math.abs(this.offsetY) === MAX_MOVE_Y || Math.abs(this.offsetY) === 0) {
      this.offsetYDirection *= -1;
    }
  }

  /**
   * Update the weapon when in an disabled state.
   * @param  {Number} delta The delta time.
   */
  updateDisabled(delta) {
    this.timer += delta * TIME_STEP;

    if (this.timer >= this.idleTime) {
      this.setIdle();
      this.timer = 0;
    }
  }

  /**
   * Update the weapon when in an arming state.
   * @param  {Number} delta The delta time.
   */
  updateArming(delta) {
    this.offsetY -= MAX_MOVE_X * delta;

    if (this.offsetY <= 0) {
      this.offsetY = 0;
      this.setIdle();
    }
  }

  /**
   * Update the weapon when in an unarming state.
   * @param  {Number} delta The delta time.
   */
  updateUnarming(delta) {
    this.offsetY += MAX_MOVE_X * delta;

    if (this.offsetY >= CELL_SIZE) {
      this.offsetY = CELL_SIZE;

      if (this.player.isAlive()) {
        this.setUnarmed();
      }
    }
  }

  /**
   * Set the state to idle.
   * @return {Boolean} Has the state changed to idle.
   */
  setIdle() {
    return this.setState(STATES.IDLE);
  }

  /**
   * Set the state to firing.
   * @return {Boolean} Has the state changed to firing.
   */
  setFiring() {
    const stateChanged = this.setState(STATES.FIRING);

    if (stateChanged) {
      this.ammo -= 1;
    }

    return stateChanged;
  }

  /**
   * Set the state to disabled.
   * @return {Boolean} Has the state changed to disabled.
   */
  setDisabled() {
    return this.setState(STATES.DISABLED);
  }

  /**
   * Set the state to arming.
   * @return {Boolean} Has the state changed to arming.
   */
  setArming() {
    const stateChange = this.setState(STATES.ARMING);

    if (stateChange) {
      this.emit(EVENTS.ARMING);
    }

    return this.setState(STATES.ARMING);
  }

  /**
   * Set the state to unarming.
   * @return {Boolean} Has the state changed to unarming.
   */
  setUnarming() {
    return this.setState(STATES.UNARMING);
  }

  /**
   * Set the state to unarmed.
   */
  setUnarmed() {
    return this.setState(STATES.UNARMED);
  }

  /**
   * Is the weapon in the idle state.
   * @return {Boolean}
   */
  isIdle() {
    return this.state === STATES.IDLE;
  }

  /**
   * Is the weapon in the firing state.
   * @return {Boolean}
   */
  isFiring() {
    return this.state === STATES.FIRING;
  }

  /**
   * Is the weapon in the disabled state.
   * @return {Boolean}
   */
  isDisabled() {
    return this.state === STATES.DISABLED;
  }

  /**
   * Is the weapon in the arming state.
   * @return {Boolean}
   */
  isArming() {
    return this.state === STATES.ARMING;
  }

  /**
   * Is the weapon in the unarming state.
   * @return {Boolean}
   */
  isUnarming() {
    return this.state === STATES.UNARMING;
  }

  /**
   * Is the weapon in the unarmed state.
   * @return {Boolean}
   */
  isUnarmed() {
    return this.state === STATES.UNARMED;
  }

  /**
   * Is the weapon automatic.
   * @return {Boolean} Boolean Is the weapon is automatic.
   */
  isAutomatic() {
    return this.idleTime === 0;
  }

  get props() {
    const {
      power,
      idleTime,
      recoil,
      ammo,
      maxAmmo,
      range,
    } = this;

    return {
      power,
      idleTime,
      recoil,
      ammo,
      maxAmmo,
      range,
    };
  }
}

export default Weapon;
