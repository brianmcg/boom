import { CELL_SIZE } from '@game/constants/config';
import ProjectileEnemy from '../ProjectileEnemy';

const STATES = {
  HIDING: 'enemy:hiding',
  DESCENDING: 'enemy:descending',
};

class Arachnacopter extends ProjectileEnemy {
  constructor({ maxElavation, ...other }) {
    super(other);

    this.maxElavation = maxElavation * CELL_SIZE;
    this.z = this.maxElavation;
    this.graphIndex = 0;
    this.hideTimer = 0;
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

  updateHiding() {
    if (!this.parent.player.cell.entrance) {
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
    this.z += this.speed * delta;

    if (this.z >= this.maxElavation) {
      this.stopUpdates();
      this.spawnSecondPhase();
      this.parent.remove(this);
    }
  }

  hurt(...options) {
    if (this.state !== STATES.HIDING) {
      super.hurt(...options);
    }
  }

  spawnSecondPhase() {
    const distances = this.parent.spawnPoints.map(c => this.getDistanceTo(c));
    const nearest = Math.min(...distances);
    const index = distances.indexOf(nearest);
    const { x, y } = this.parent.spawnPoints[index];

    const spawnEnemy = this.parent.enemies.find(e => e.name === this.spawnEnemy);

    spawnEnemy.setPos({ x, y, z: this.z });

    this.parent.add(spawnEnemy);
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
      this.stopSound(this.sounds.constant);
      return true;
    }

    return false;
  }

  setDescending() {
    if (this.setState(STATES.DESCENDING)) {
      this.emitSound(this.sounds.constant, true);

      return true;
    }

    return false;
  }

  setHiding() {
    return this.setState(STATES.HIDING);
  }
}

export default Arachnacopter;
