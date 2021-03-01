import { CELL_SIZE } from 'game/constants/config';
import Entity from '../../../Entity';
import Bullet from '../../../Bullet';

const STATES = {
  FIRING: 'weapon:firing',
  IDLE: 'weapon:idle',
  DISABLED: 'weapon:disabled',
};

const EVENTS = {
  FIRE: 'weapon:fire',
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
    spread,
    equiped,
    recoil,
    maxAmmo,
    range,
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
    this.range = range ? (range * CELL_SIZE) + (player.width / 4) : Number.MAX_VALUE;
    this.type = type;
    this.spread = [...Array(spread).keys()].map(i => i);
    this.spreadAngle = spread > 1 ? Math.atan2(CELL_SIZE, this.range) / 2 : 0;
    this.pelletAngle = spread > 1 ? Math.atan2(CELL_SIZE, this.range) / spread : 0;

    this.bullets = this.type === 1
      ? [...Array(10).keys()].map(() => new Bullet({
        explosionType: this.explosionType,
      }))
      : null;

    this.setDisabled();
  }

  /**
   * Add a callback to the fire event.
   * @param  {Function} callback The callback.
   */
  onFire(callback) {
    this.on(EVENTS.FIRE, callback);
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
      case STATES.FIRING:
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
    if (this.isIdle() && (this.type === 0 || this.ammo)) {
      return this.setFiring();
    }

    return false;
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
  setFiring() {
    const isStateChanged = this.setState(STATES.FIRING);

    if (isStateChanged) {
      this.emit(EVENTS.FIRE);
      this.ammo -= 1;

      if (this.ammo === 0) {
        this.stop();
      }
    }

    return isStateChanged;
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

  get props() {
    const {
      power,
      recoil,
      ammo,
      maxAmmo,
      range,
      type,
      explosionType,
      sounds,
      equiped,
      rate,
      accuracy,
      spread,
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
      range,
      spread: spread.length,
    };
  }
}

export default Weapon;
