import { degrees } from 'game/core/physics';
import { CELL_SIZE } from 'game/constants/config';
import Weapon from '../Weapon';
import HitScan from '../../../HitScan';

const DEG_360 = degrees(360);

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
class HitScanWeapon extends Weapon {
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
   * Use the weapon.
   */
  use() {
    if (super.use() && (this.ammo > 0 || this.ammo === null)) {
      const {
        power,
        recoil,
        accuracy,
        pellets,
        spreadAngle,
        pelletAngle,
        range,
        hitScans,
        player,
        sounds,
      } = this;

      let rayAngle = (player.angle - spreadAngle + DEG_360) % DEG_360;

      for (let i = 0; i < pellets.length; i += 1) {
        const hitScan = hitScans.shift();

        if (hitScan) {
          hitScan.execute({
            ray: player.castRay(rayAngle),
            damage: power * (Math.floor(Math.random() * accuracy) + 1),
            parent: player.parent,
            range,
            power,
          });

          hitScans.push(hitScan);

          rayAngle = (rayAngle + pelletAngle) % DEG_360;
        }
      }

      this.emit(EVENTS.USE, {
        recoil,
        sound: sounds.fire,
      });

      if (this.ammo !== null) {
        this.ammo -= 1;
      }

      if (this.ammo === 0) {
        this.stop();
      }

      return true;
    }

    return false;
  }
}

export default HitScanWeapon;
