import ProjectileEnemy from '../ProjectileEnemy';

const STATES = {
  HIDING: 'enemy:hiding',
  DESCENDING: 'enemy:descending',
};

const MAX_Z = 200;

const HIDE_TIME = 5000;

class Arachnacopter extends ProjectileEnemy {
  constructor(options) {
    super(options);

    this.graphIndex = 0;
    this.hideTimer = 0;
    this.z = MAX_Z;
  }

  start() {
    this.setHiding();
  }

  update(delta, elapsedMS) {
    switch (this.state) {
      case STATES.HIDING:
        this.updateHiding(delta, elapsedMS);
        break;
      case STATES.DESCENDING:
        this.updateDescending(delta, elapsedMS);
        break;
      default:
        break;
    }

    super.update(delta, elapsedMS);
  }

  updateIdle() {
    if (this.findPlayer()) {
      this.setAlerted();
    } else {
      this.setEvading();
    }
  }

  updateHiding(delta, elapsedMS) {
    this.hideTimer += elapsedMS;

    if (this.hideTimer >= HIDE_TIME) {
      this.hideTimer = 0;
      this.setDescending();
    }
  }

  updateDescending(delta) {
    this.z -= this.speed * delta;

    if (this.z <= 0) {
      this.z = 0;
      this.setIdle();
    }
  }

  updateEvading() {
    if (this.nextCell) {
      this.face(this.nextCell);

      if (this.isArrivedAt(this.nextCell)) {
        this.nextCell = this.path.shift();
      }
    } else {
      this.setIdle();
    }
  }

  updateDead(delta) {
    this.z += this.speed * 0.5 * delta;

    if (this.z >= MAX_Z) {
      this.stopUpdates();

      this.spawnSecondPhase();
    }
  }

  spawnSecondPhase() {
    const distances = this.parent.spawnPoints.map(c => this.getDistanceTo(c));
    const nearest = Math.min(...distances);
    const index = distances.indexOf(nearest);
    const spawnPoint = this.parent.spawnPoints[index];
  }

  findEvadeDestination() {
    const index = Math.floor(Math.random() * this.parent.waypoints.length);
    return this.parent.waypoints[index];
  }

  setEvading() {
    if (super.setEvading()) {
      this.path = this.findPath(this.evadeDestination);
      this.nextCell = this.path.shift();

      return true;
    }

    return false;
  }

  setDead() {
    if (super.setDead()) {
      this.onStopMoving(true);
      return true;
    }

    return false;
  }

  setDescending() {
    return this.setState(STATES.DESCENDING);
  }

  setHiding() {
    if (this.setState(STATES.HIDING)) {
      const { x, y } = this.findEvadeDestination();
      this.x = x;
      this.y = y;

      return true;
    }

    return false;
  }
}

export default Arachnacopter;
