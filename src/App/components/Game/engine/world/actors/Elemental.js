import ProjectileEnemy from './ProjectileEnemy';

const STATES = {
  ASCENDING: 'enemy:ascending',
  DESCENDING: 'enemy:descending',
  HIDING: 'enemy:hiding',
};

export default class Elemental extends ProjectileEnemy {
  constructor(options) {
    super(options);
    this.setHiding();
  }

  update(delta, elapsedMS) {
    switch (this.state) {
      case STATES.HIDING:
        this.updateHiding(delta, elapsedMS);
        break;
      case STATES.ASCENDING:
        this.updateAscending(delta, elapsedMS);
        break;
      case STATES.DESCENDING:
        this.updateDescending(delta, elapsedMS);
        break;
      default:
        break;
    }

    super.update(delta, elapsedMS);
  }

  // updateHiding(delta, elapsedMS) {}

  // updateAscending(delta, elapsedMS) {}

  // updateDescending(delta, elapsedMS) {}

  setAscending() {
    return this.setState(STATES.ASCENDING);
  }

  setDescending() {
    return this.setState(STATES.DESCENDING);
  }

  setHiding() {
    return this.setState(STATES.HIDING);
  }
}
