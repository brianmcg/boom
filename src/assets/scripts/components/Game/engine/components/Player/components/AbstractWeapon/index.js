import { CELL_SIZE, DEBUG } from 'game/constants/config';
import Entity from '../../../Entity';

const STATES = {
  USING: 'weapon:using',
  IDLE: 'weapon:idle',
  DISABLED: 'weapon:disabled',
};

const EVENTS = {
  USE: 'weapon:use',
  STOP: 'weapon:stop',
};

const transformRangeForWorld = (
  range,
  offset,
) => (range ? (range * CELL_SIZE) + offset : Number.MAX_VALUE);

const transformRangeForData = (
  range,
  offset,
) => (range === Number.MAX_VALUE ? null : (range - offset) / CELL_SIZE);


/**
 * Class representing a weapon.
 */
class AbstractWeapon extends Entity {
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
    ammo,
    rate,
    automatic,
    type,
    maxAttacks,
    projectile,
    ...other
  }) {
    super(other);

    this.name = name;
    this.sounds = sounds;
    this.power = power;
    this.accuracy = accuracy;
    this.rate = rate;
    this.equiped = DEBUG || equiped;
    this.player = player;
    this.automatic = automatic;
    this.recoil = recoil;
    this.ammo = ammo !== undefined ? ammo : (maxAmmo / 2 || null);
    this.maxAmmo = maxAmmo;
    this.timer = 0;
    this.range = transformRangeForWorld(range, player.width / 2);
    this.spread = spread;
    this.type = type;
    this.pellets = [...Array(pellets).keys()].map(i => i);
    this.spreadAngle = pellets > 1 ? Math.atan2(CELL_SIZE, spread * CELL_SIZE) / 2 : 0;
    this.pelletAngle = pellets > 1 ? Math.atan2(CELL_SIZE, spread * CELL_SIZE) / pellets : 0;
    this.maxAttacks = maxAttacks;
    this.projectile = projectile;

    this.setIdle();

    if (this.constructor === AbstractWeapon) {
      throw new TypeError('Can not construct abstract class.');
    }
  }

  /**
   * Add a callback to the use event.
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
   * Add a callback to the diabled event.
   * @param  {Function} callback The callback.
   */
  onDisabled(callback) {
    this.on(STATES.DISABLED, callback);
  }

  /**
   * Add a callback to the diabled event.
   * @param  {Function} callback The callback.
   */
  onIdle(callback) {
    this.on(STATES.IDLE, callback);
  }

  /**
   * Update the weapon.
   * @param  {Number} delta The delta time.
   * @param  {Number} elapsedMS The elapsed time.
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
    if (this.constructor === AbstractWeapon) {
      throw new TypeError('You have to implement this method.');
    }

    if (this.ammo !== null) {
      this.ammo -= 1;
    }

    if (this.ammo === 0) {
      this.stop();
    }

    this.emit(EVENTS.USE, {
      recoil: this.recoil,
      sound: this.sounds.use,
    });
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
   * Can the weapon be used.
   * @return {Boolean}
   */
  isUseable() {
    return this.isIdle() && (this.ammo > 0 || this.ammo === null);
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
      name,
      power,
      recoil,
      maxAmmo,
      range,
      spread,
      type,
      sounds,
      equiped,
      rate,
      accuracy,
      pellets,
      player,
      ammo,
      maxAttacks,
      projectile,
    } = this;

    return {
      name,
      power,
      recoil,
      maxAmmo,
      type,
      sounds,
      equiped,
      rate,
      accuracy,
      ammo,
      maxAttacks,
      projectile,
      range: transformRangeForData(range, player.width / 2),
      spread,
      pellets: pellets.length,
    };
  }
}

export default AbstractWeapon;
