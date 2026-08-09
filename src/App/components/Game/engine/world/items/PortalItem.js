import AbstractItem from './AbstractItem';

export default class PortalItem extends AbstractItem {
  constructor(options) {
    super(options);

    this.isPortal = true;
  }

  onAdded(parent) {
    super.onAdded(parent);

    this.emitSound(this.sounds.open);
    this.emitSound(this.sounds.swirl, true);
  }
}
