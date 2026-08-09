import MeleeWeapon from './MeleeWeapon';

export default class SecondaryWeapon extends MeleeWeapon {
  constructor(options) {
    super(options);
    this.secondary = true;
  }

  onComplete() {
    this.setAiming();
  }

  setAiming() {
    const isStateChanged = super.setAiming();

    if (isStateChanged) {
      this.player.selectPreviousWeapon();
    }

    return isStateChanged;
  }
}
