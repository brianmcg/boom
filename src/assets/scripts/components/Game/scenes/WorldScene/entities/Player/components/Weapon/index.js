import { CELL_SIZE } from 'game/constants/config';
import Entity from '../../../Entity';
import HitScan from '../../../HitScan';

const STATES = {
  USING: 'weapon:using',
  IDLE: 'weapon:idle',
  DISABLED: 'weapon:disabled',
};

const EVENTS = {
  USE: 'weapon:use',
  STOP: 'weapon:stop',
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
   * @param  {Number}  options.recoil   The recoil of the weapon.
   * @param  {Number}  options.maxAmmo  The max amount of ammo the weapon can hold.
   * @param  {Number}  options.range    The range of the weapon.
   * @param  {String}  options.texture  The weapon texture.
   */
  constructor({
    player,
    power,
    accuracy,
    pellets,
    equiped,
    recoil,
    maxAmmo,
    range,
    spread,
    sounds,
    name,
    explosionType,
    ammo,
    rate,
    automatic,
    type,
    ...other
  }) {
    super(other);

    this.name = name;
    this.explosionType = explosionType;
    this.sounds = sounds;
    this.power = power;
    this.accuracy = accuracy;
    this.rate = rate;
    this.equiped = equiped;
    this.player = player;
    this.automatic = automatic;
    this.recoil = recoil;
    this.ammo = ammo !== undefined ? ammo : (maxAmmo / 2 || null);
    this.maxAmmo = maxAmmo;
    this.timer = 0;
    this.range = range ? (range * CELL_SIZE) + (player.width / 2) : Number.MAX_VALUE;
    this.spread = spread;
    this.type = type;
    this.pellets = [...Array(pellets).keys()].map(i => i);
    this.spreadAngle = pellets > 1 ? Math.atan2(CELL_SIZE, spread * CELL_SIZE) / 2 : 0;
    this.pelletAngle = pellets > 1 ? Math.atan2(CELL_SIZE, spread * CELL_SIZE) / pellets : 0;

    this.hitScans = [...Array(10).keys()].map(() => new HitScan({
      explosionType: this.explosionType,
    }));


    this.setDisabled();
  }

  /**
   * Add a callback to the fire event.
   * @param  {Function} callback The callback.
   */
  onUse(callback) {
    this.on(EVENTS.USE, callback);
  }

  /**
   * Add a callback to the stop event.
   * @param  {Function} callback The callback.
   */
  onStop(callback) {
    this.on(EVENTS.STOP, callback);
  }

  /**
   * Update the weapon.
   * @param  {Number} delta The delta time.
   */
  update(delta, elapsedMS) {
    switch (this.state) {
      case STATES.USING:
        this.setDisabled();
        break;
      case STATES.DISABLED:
        this.timer += elapsedMS;

        if (this.timer >= this.rate) {
          this.setIdle();
          this.timer = 0;
        }

        break;
      default:
        break;
    }
  }

  /**
   * Fire the weapon.
   */
  use() {
    return this.isIdle() && this.setUsing();
  }

  /**
   * Stop using the weapon.
   */
  stop() {
    this.emit(EVENTS.STOP);
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
    return this.setState(STATES.IDLE);
  }

  /**
   * Set the state to firing.
   * @return {Boolean} Has the state changed to firing.
   */
  setUsing() {
    return this.setState(STATES.USING);
  }

  /**
   * Set the state to disabled.
   * @return {Boolean} Has the state changed to disabled.
   */
  setDisabled() {
    return this.setState(STATES.DISABLED);
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
  isUsing() {
    return this.state === STATES.USING;
  }

  /**
   * Is the weapon in the disabled state.
   * @return {Boolean}
   */
  isDisabled() {
    return this.state === STATES.DISABLED;
  }

  get props() {
    const {
      power,
      recoil,
      ammo,
      maxAmmo,
      range,
      spread,
      type,
      explosionType,
      sounds,
      equiped,
      rate,
      accuracy,
      pellets,
      player,
    } = this;

    return {
      power,
      recoil,
      ammo,
      maxAmmo,
      type,
      explosionType,
      sounds,
      equiped,
      rate,
      accuracy,
      range: range === Number.MAX_VALUE
        ? null
        : (range - (player.width / 2)) / CELL_SIZE,
      spread,
      pellets: pellets.length,
    };
  }
}

export default Weapon;
