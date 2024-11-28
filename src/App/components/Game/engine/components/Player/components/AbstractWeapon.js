import { CELL_SIZE } from '@constants/config';

const STATES = {
  USING: 'weapon:using',
  AIMING: 'weapon:aiming',
  LOADING: 'weapon:loading',
};

const transformRangeForWorld = (range, offset) =>
  range ? range * CELL_SIZE + offset : Number.MAX_VALUE;

const transformRangeForData = (range, offset) =>
  range === Number.MAX_VALUE ? null : (range - offset) / CELL_SIZE;

export default class AbstractWeapon {
  constructor({
    accuracy,
    ammo,
    anchorX = 0.5,
    anchorY = 1,
    automatic,
    equiped,
    flash = 0,
    maxAmmo,
    name,
    pellets,
    player,
    power,
    projectile,
    range,
    rate,
    recoil = 0,
    scale = 1,
    sounds,
    spread,
    type,
  }) {
    if (this.constructor === AbstractWeapon) {
      throw new TypeError('Can not construct abstract class.');
    }

    this.anchorX = anchorX;
    this.anchorY = anchorY;
    this.power = power;
    this.accuracy = accuracy;
    this.rate = rate;
    this.equiped = equiped;
    this.player = player;
    this.automatic = automatic;
    this.recoil = recoil;
    this.flash = flash;
    this.ammo = ammo !== undefined ? ammo : maxAmmo / 2 || null;
    this.maxAmmo = maxAmmo;
    this.timer = 0;
    this.range = transformRangeForWorld(range, player.width / 2);
    this.spread = spread;
    this.type = type;
    this.pellets = [...Array(pellets).keys()].map(i => i);
    this.spreadAngle =
      pellets > 1 ? Math.atan2(CELL_SIZE, spread * CELL_SIZE) / 2 : 0;
    this.pelletAngle =
      pellets > 1 ? Math.atan2(CELL_SIZE, spread * CELL_SIZE) / pellets : 0;
    this.projectile = projectile;
    this.state = STATES.AIMING;
    this.name = name;
    this.scale = scale;
    this.sounds = sounds;
  }

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
    }
  }

  use() {
    if (this.constructor === AbstractWeapon) {
      throw new TypeError('You have to implement this method.');
    }

    return { success: this.canUse() && this.setUsing() };
  }

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

  canUse() {
    return this.isAiming();
  }

  setAiming() {
    return this.setState(STATES.AIMING);
  }

  setUsing() {
    return this.setState(STATES.USING);
  }

  setLoading() {
    return this.setState(STATES.LOADING);
  }

  isAiming() {
    return this.state === STATES.AIMING;
  }

  isUsing() {
    return this.state === STATES.USING;
  }

  isLoading() {
    return this.state === STATES.LOADING;
  }

  setState(state) {
    if (this.state !== state) {
      this.timer = 0;
      this.state = state;

      return true;
    }

    return false;
  }

  get props() {
    const {
      accuracy,
      ammo,
      anchorX,
      equiped,
      flash,
      maxAmmo,
      name,
      pellets,
      player,
      power,
      projectile,
      range,
      rate,
      recoil,
      scale,
      sounds,
      spread,
      type,
    } = this;

    return {
      accuracy,
      ammo,
      anchorX,
      equiped,
      flash,
      maxAmmo,
      name,
      pellets: pellets.length,
      power,
      projectile,
      range: transformRangeForData(range, player.width / 2),
      rate,
      recoil,
      scale,
      sounds,
      spread,
      type,
    };
  }
}
