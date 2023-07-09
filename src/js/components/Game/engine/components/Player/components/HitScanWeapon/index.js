import { degrees } from '@game/core/physics';
import AbstractWeapon, { EVENTS } from '../AbstractWeapon';
import HitScan from '../../../HitScan';

const DEG_360 = degrees(360);

/**
 * Class representing a hitscan weapon.
 */
class HitScanWeapon extends AbstractWeapon {
  /**
   * Creates a hitscan weapon.
   * @param  {Player}  options.player       The player.
   * @param  {Number}  options.power        The power of the weapon.
   * @param  {Boolean} options.equiped      Is the weapon equiped.
   * @param  {Number}  options.recoil       The recoil of the weapon.
   * @param  {Number}  options.maxAmmo      The max amount of ammo the weapon can hold.
   * @param  {Number}  options.range        The range of the weapon.
   * @param  {Number}  options.accuracy     The accuracy of the weapon.
   * @param  {Number}  options.pellets      The number of pellets per use.
   * @param  {Number}  options.spread       The spread of the pellets.
   * @param  {Object}  options.sounds       The weapon sounds.
   * @param  {String}  options.name         The weapon name.
   * @param  {Number}  options.ammo         The ammo of the weapon.
   * @param  {Number}  options.rate         The rate of fire.
   * @param  {Number}  options.automatic    Automatic weapon option.
   * @param  {Number}  options.type         The type of weapon.
   * @param  {Object}  options.projectile   The weapon projectile data.
   * @param  {Boolean} options.secondary    The weapon is secondary.
   * @param  {Boolean} options.penetration  The weapon penetration.
   */
  constructor({ penetration, ...other }) {
    super(other);

    const { amount, effects } = this.projectile;

    this.penetration = penetration;

    this.projectiles = [...Array(amount).keys()].map(
      () =>
        new HitScan({
          effect: effects?.impact,
          source: this.player,
          power: this.power,
          range: this.range,
          accuracy: this.accuracy,
          penetration,
          instantKill: this.secondary,
        }),
    );
  }

  /**
   * Use the weapon.
   */
  use() {
    if (this.isUseable() && this.setUsing()) {
      const { pellets, spreadAngle, pelletAngle, projectiles, player } = this;

      const collisions = [];

      const projectileAngle = (player.angle - player.moveAngle + DEG_360) % DEG_360;

      let rayAngle = (projectileAngle - spreadAngle + DEG_360) % DEG_360;

      for (let i = 0; i < pellets.length; i++) {
        const projectile = projectiles.shift();
        const emitLight = !this.isMelee() && (i === 0 || i === pellets.length - 1);

        if (projectile) {
          projectile.run(rayAngle, emitLight).forEach(collision => {
            collisions.push(collision);
          });
          projectiles.push(projectile);
          rayAngle = (rayAngle + pelletAngle) % DEG_360;
        }
      }

      if (this.isMelee()) {
        const recoil = !collisions.length ? 0 : this.recoil;
        const sound = this.secondary && !collisions.length ? null : this.sounds.use;
        this.emit(EVENTS.USE, { recoil, sound });
      } else {
        super.use();
      }
    }
  }

  /**
   * Get the weapon props.
   * @return {Object} The weapon props.
   */
  get props() {
    return { ...super.props, penetration: this.penetration };
  }
}

export default HitScanWeapon;
