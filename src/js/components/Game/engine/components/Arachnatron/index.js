import GunEnemy from '../GunEnemy';

const STATES = {
  HIDING: 'enemy:hiding',
  DESCENDING: 'enemy:descending',
};

class Arachnatron extends GunEnemy {
  constructor(options) {
    super(options);

    this.blocking = false;
    this.setHiding();
  }

  onAdded(parent) {
    super.onAdded(parent);
    this.setDescending();
  }

  update(delta, elapsedMS) {
    switch (this.state) {
      case STATES.HIDING:
        break;
      case STATES.DESCENDING:
        this.updateDescending(delta, elapsedMS);
        break;
      default:
        break;
    }

    super.update(delta, elapsedMS);
  }

  updateDescending(delta) {
    this.z -= this.speed * 2.5 * delta;

    if (this.z <= 0) {
      this.z = 0;
      this.blocking = true;
      this.setIdle();
    }
  }

  setHiding() {
    return this.setState(STATES.HIDING);
  }

  setDescending() {
    return this.setState(STATES.DESCENDING);
  }
}

export default Arachnatron;
