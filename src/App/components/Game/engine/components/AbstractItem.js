import { CELL_SIZE } from '@constants/config';
import DynamicEntity from './DynamicEntity';

const SCALE_INCREMENT = 0.05;

const FORCE_FADE = 0.85;

const MIN_FORCE = 0.1;

const STATES = {
  RESPAWNING: 'item:respawning',
  SPAWNING: 'item:spawning',
};

export default class AbstractItem extends DynamicEntity {
  constructor({ type, floorOffset, respawn, ...other }) {
    super({ blocking: false, autoPlay: false, ...other });

    this.isItem = true;
    this.type = type;
    this.respawn = respawn;
    this.timer = 0;

    if (respawn) {
      this.setRespawning();
    }

    if (floorOffset) {
      this.z = CELL_SIZE * floorOffset * 0.75;
    }

    if (this.constructor === AbstractItem) {
      throw new TypeError('Can not construct abstract class.');
    }
  }

  onAdded(parent) {
    super.onAdded(parent);
    this.nextParent = parent;
  }

  onRemoved() {
    if (this.respawn) {
      this.startUpdates();
    } else {
      super.onRemoved();
    }
  }

  update(delta, elapsedMS) {
    switch (this.state) {
      case STATES.RESPAWNING:
        this.updateRespawning(delta, elapsedMS);
        break;
      case STATES.SPAWNING:
        this.updateSpawning(delta, elapsedMS);
        break;
      default:
        break;
    }
  }

  updateRespawning(delta, elapsedMS) {
    this.timer += elapsedMS;

    if (!this.cell.bodies.some(b => b.blocking) && this.timer >= this.respawn) {
      this.timer = 0;
      this.scale = 0;
      this.parent.add(this);
    }

    if (this.scale < 1) {
      this.scale += SCALE_INCREMENT * delta;

      if (this.scale >= 1) {
        this.scale = 1;

        this.stopUpdates();
      }
    }
  }

  updateSpawning(delta, elapsedMS) {
    this.scale += SCALE_INCREMENT * delta;
    this.velocity *= FORCE_FADE;

    if (this.scale >= 1) {
      this.scale = 1;
    }

    if (this.velocity <= MIN_FORCE) {
      this.velocity = 0;
    }

    if (
      Object.entries(this.sounds).length === 0 &&
      this.velocity === 0 &&
      this.scale === 1
    ) {
      this.stopUpdates();
    }

    if (this.parent) {
      super.update(delta, elapsedMS);
    }
  }

  setSpawning() {
    const isStateChanged = this.setState(STATES.SPAWNING);

    if (isStateChanged) {
      this.startUpdates();
    }

    return isStateChanged;
  }

  setRespawning() {
    return this.setState(STATES.RESPAWNING);
  }

  setRemoved() {
    this.isRemoved = true;
  }

  destroy(options) {
    super.destroy(options);
    this.nextParent = null;
  }
}
