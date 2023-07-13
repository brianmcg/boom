import { CELL_SIZE, GOD_MODE } from '@game/constants/config';
import { EventEmitter } from '@game/core/graphics';

const STATES = {
  USING: 'weapon:using',
  IDLE: 'weapon:idle',
  DISABLED: 'weapon:disabled',
};

const EVENTS = {
  USE: 'weapon:use',
  STOP: 'weapon:stop',
};

const transformRangeForWorld = (range, offset) =>
  range ? range * CELL_SIZE + offset : Number.MAX_VALUE;

const transformRangeForData = (range, offset) =>
  range === Number.MAX_VALUE ? null : (range - offset) / CELL_SIZE;

/**
 * Class representing a weapon.
 * @extends {EventEmitter}
 */
class AbstractWeapon extends EventEmitter {
  /**
   * Creates a weapon.
   * @param  {Player}  options.player     The player.
   * @param  {Number}  options.power      The power of the weapon.
   * @param  {Boolean} options.equiped    Is the weapon equiped.
   * @param  {Number}  options.recoil     The recoil of the weapon.
   * @param  {Number}  options.maxAmmo    The max amount of ammo the weapon can hold.
   * @param  {Number}  options.range      The range of the weapon.
   * @param  {Number}  options.accuracy   The accuracy of the weapon.
   * @param  {Number}  options.pellets    The number of pellets per use.
   * @param  {Number}  options.spread     The spread of the pellets.
   * @param  {Object}  options.sounds     The weapon sounds.
   * @param  {String}  options.name       The weapon name.
   * @param  {Number}  options.ammo       The ammo of the weapon.
   * @param  {Number}  options.rate       The rate of fire.
   * @param  {Number}  options.automatic  Automatic weapon option.
   * @param  {Number}  options.type       The type of weapon.
   * @param  {Object}  options.projectile The weapon projectile data.
   * @param  {Boolean} options.secondary  The weapon is secondary.
   * @param  {Number}  options.anchorX    The x anchor of the weapon.
   * @param  {Number}  options.anchorY    The y anchor of the weapon.
   * @param  {Number}  options.scale      The scale of the weapon.
   * @param  {Boolean} options.melee      The melee option.
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
    projectile,
    secondary,
    anchorX = 0.5,
    anchorY = 1,
    scale = 1,
  }) {
    super();

    this.anchorX = anchorX;
    this.anchorY = anchorY;
    this.scale = scale;

    this.name = name;
    this.sounds = sounds;
    this.power = power;
    this.accuracy = accuracy;
    this.rate = rate;
    this.equiped = equiped;
    this.player = player;
    this.automatic = automatic;
    this.recoil = recoil;
    this.ammo = ammo !== undefined ? ammo : maxAmmo / 2 || null;
    this.maxAmmo = maxAmmo;
    this.timer = 0;
    this.range = transformRangeForWorld(range, player.width / 2);
    this.spread = spread;
    this.type = type;
    this.pellets = [...Array(pellets).keys()].map(i => i);
    this.spreadAngle = pellets > 1 ? Math.atan2(CELL_SIZE, spread * CELL_SIZE) / 2 : 0;
    this.pelletAngle = pellets > 1 ? Math.atan2(CELL_SIZE, spread * CELL_SIZE) / pellets : 0;
    this.projectile = projectile;
    this.secondary = secondary;

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

  // /**
  //  * Add a callback to the diabled event.
  //  * @param  {Function} callback The callback.
  //  */
  // onDisabled(callback) {
  //   this.on(STATES.DISABLED, callback);
  // }

  // /**
  //  * Add a callback to the diabled event.
  //  * @param  {Function} callback The callback.
  //  */
  // onIdle(callback) {
  //   console.log('ON_IDLE', callback);
  //   this.on(STATES.IDLE, callback);
  // }

  /**
   * Update the weapon.
   * @param  {Number} delta The delta time.
   * @param  {Number} elapsedMS The elapsed time in milliseconds.
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
        }

        break;
      default:
        break;
    }
  }

  /**
   * Use the weapon.
   */
  use() {
    if (this.constructor === AbstractWeapon) {
      throw new TypeError('You have to implement this method.');
    }

    if (this.ammo > 0) {
      this.ammo -= GOD_MODE ? 0 : 1;

      this.emit(EVENTS.USE, { recoil: this.recoil, sound: this.sounds.use });

      if (this.ammo === 0) {
        this.stop();
      }
    }
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
    return this.isIdle() && (this.ammo > 0 || this.isMelee());
  }

  /**
   * Is it a melee weapon.
   * @return {Boolean}
   */
  isMelee() {
    return this.ammo == null;
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
   * Set the state to using.
   * @return {Boolean} Has the state changed to using.
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
   * Is the weapon in the using state.
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

  /**
   * Get the weapon props.
   * @return {Object} The weapon props.
   */
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
      projectile,
      secondary,
      scale,
      anchorX,
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
      projectile,
      range: transformRangeForData(range, player.width / 2),
      spread,
      pellets: pellets.length,
      secondary,
      scale,
      anchorX,
    };
  }

  /**
   * Set the weapon state.
   * @param {String} state The new state.
   */
  setState(state) {
    if (this.state !== state) {
      this.timer = 0;
      this.state = state;

      return true;
    }

    return false;
  }

  destroy() {
    this.removeAllListeners();
  }
}

export { EVENTS };

export default AbstractWeapon;
