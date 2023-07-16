import { CELL_SIZE } from '@game/constants/config';
import DynamicEntity from '../../../DynamicEntity';

const STATES = {
  USING: 'weapon:using',
  AIMING: 'weapon:aiming',
  LOADING: 'weapon:loading',
};

const transformRangeForWorld = (range, offset) =>
  range ? range * CELL_SIZE + offset : Number.MAX_VALUE;

const transformRangeForData = (range, offset) =>
  range === Number.MAX_VALUE ? null : (range - offset) / CELL_SIZE;

/**
 * Class representing a weapon.
 * @extends {EventEmitter}
 */
class AbstractWeapon extends DynamicEntity {
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
    recoil = 0,
    maxAmmo,
    range,
    spread,
    ammo,
    rate,
    automatic,
    type,
    projectile,
    secondary,
    anchorX = 0.5,
    anchorY = 1,
    flash = 0,
    ...other
  }) {
    super(other);

    this.flash = flash;

    this.anchorX = anchorX;
    this.anchorY = anchorY;
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

    if (this.constructor === AbstractWeapon) {
      throw new TypeError('Can not construct abstract class.');
    }
  }

  /**
   * Update the weapon.
   * @param  {Number} delta The delta time.
   * @param  {Number} elapsedMS The elapsed time in milliseconds.
   */
  update(delta, elapsedMS) {
    switch (this.state) {
      case STATES.USING:
        this.setLoading();
        break;
      case STATES.LOADING:
        this.updateLoading(delta, elapsedMS);
        break;
      default:
        break;
    }
  }

  updateLoading(delta, elapsedMS) {
    this.timer += elapsedMS;

    if (this.timer >= this.rate) {
      this.setAiming();

      if (this.secondary) {
        this.player.selectPreviousWeapon();
      }
    }
  }

  /**
   * Use the weapon.
   */
  use() {
    if (this.constructor === AbstractWeapon) {
      throw new TypeError('You have to implement this method.');
    }

    return { success: this.canUse() && this.setUsing() };
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
  canUse() {
    return this.isAiming();
  }

  /**
   * Set the state to aiming.
   * @return {Boolean} Has the state changed to aiming.
   */
  setAiming() {
    return this.setState(STATES.AIMING);
  }

  /**
   * Set the state to using.
   * @return {Boolean} Has the state changed to using.
   */
  setUsing() {
    return this.setState(STATES.USING);
  }

  /**
   * Set the state to loading.
   * @return {Boolean} Has the state changed to loading.
   */
  setLoading() {
    if (this.setState(STATES.LOADING)) {
      return true;
    }

    return false;
  }

  /**
   * Is the weapon in the aiming state.
   * @return {Boolean}
   */
  isAiming() {
    return this.state === STATES.AIMING;
  }

  /**
   * Is the weapon in the using state.
   * @return {Boolean}
   */
  isUsing() {
    return this.state === STATES.USING;
  }

  /**
   * Is the weapon in the loading state.
   * @return {Boolean}
   */
  isLoading() {
    return this.state === STATES.LOADING;
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

  /**
   * Destroy the weapon
   */
  destroy() {
    this.removeAllListeners();
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
}

export default AbstractWeapon;
