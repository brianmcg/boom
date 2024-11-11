import MeleeWeapon from '../MeleeWeapon';

/**
 * Class representing a weapon.
 * @extends {EventEmitter}
 */
class SecondaryWeapon extends MeleeWeapon {
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
   * @param  {Number}  options.anchorX    The x anchor of the weapon.
   * @param  {Number}  options.anchorY    The y anchor of the weapon.
   * @param  {Number}  options.scale      The scale of the weapon.
   * @param  {Boolean} options.melee      The melee option.
   */
  constructor(options) {
    super(options);
    this.secondary = true;
  }

  /**
   * Function to call when animation is complete.
   */
  onComplete() {
    this.setAiming();
  }

  /**
   * Set the state to aiming.
   * @return {Boolean} Has the state changed to aiming.
   */
  setAiming() {
    const isStateChanged = super.setAiming();

    if (isStateChanged) {
      this.player.selectPreviousWeapon();
    }

    return isStateChanged;
  }
}

export default SecondaryWeapon;
