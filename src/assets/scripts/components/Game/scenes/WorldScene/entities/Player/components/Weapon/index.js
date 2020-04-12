import { TIME_STEP } from 'game/constants/config';
import Entity from '../../../Entity';

const STATES = {
  FIRING: 'weapon:firing',
  IDLE: 'weapon:idle',
  DISABLED: 'weapon:disabled',
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
    type,
    explosionType,
    ammo,
    ...other
  }) {
    super(other);

    this.type = type;
    this.explosionType = explosionType;
    this.sounds = sounds;
    this.idleTime = idleTime;
    this.power = power;
    this.equiped = equiped;
    this.player = player;
    this.recoil = recoil;
    this.ammo = ammo !== undefined ? ammo : maxAmmo / 2;
    this.maxAmmo = maxAmmo;
    this.timer = 0;

    this.setDisabled();
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
  setEquiped() {
    this.equiped = true;
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
    if (this.isDisabled()) {
      this.timer += delta * TIME_STEP;

      if (this.timer >= this.idleTime) {
        this.setIdle();
        this.timer = 0;
      }
    }
  }

  /**
   * Add a callback to the fire event.
   * @param  {Function} callback The callback
   */
  onFireEvent(callback) {
    this.on(STATES.FIRE, callback);
  }

  /**
   * Add a callback to the diabled event.
   * @param  {Function} callback The callback.
   */
  onDisabledEvent(callback) {
    this.on(STATES.DISABLED, callback);
  }

  /**
   * Add a callback to the diabled event.
   * @param  {Function} callback The callback.
   */
  onIdleEvent(callback) {
    this.on(STATES.IDLE, callback);
  }

  /**
   * Set the state to idle.
   * @return {Boolean} Has the state changed to idle.
   */
  setIdle() {
    const isStateChanged = this.setState(STATES.IDLE);

    if (isStateChanged) {
      this.emit(STATES.IDLE);
    }

    return isStateChanged;
  }

  /**
   * Set the state to firing.
   * @return {Boolean} Has the state changed to firing.
   */
  setFiring() {
    const isStateChanged = this.setState(STATES.FIRING);

    this.emit(STATES.FIRE);

    if (isStateChanged) {
      this.ammo -= 1;
    }

    return isStateChanged;
  }

  /**
   * Set the state to disabled.
   * @return {Boolean} Has the state changed to disabled.
   */
  setDisabled() {
    const isStateChanged = this.setState(STATES.DISABLED);

    if (isStateChanged) {
      this.emit(STATES.DISABLED);
    }

    return isStateChanged;
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
      type,
      explosionType,
      sounds,
      equiped,
    } = this;

    return {
      power,
      idleTime,
      recoil,
      ammo,
      maxAmmo,
      range,
      type,
      explosionType,
      sounds,
      equiped,
    };
  }
}

export default Weapon;
