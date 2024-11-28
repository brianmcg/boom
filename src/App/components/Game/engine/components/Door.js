import translate from '@util/translate';
import { CELL_SIZE } from '@constants/config';
import DynamicCell from './DynamicCell';

const STATES = {
  OPENING: 'door:opening',
  OPENED: 'door:opened',
  CLOSING: 'door:closing',
  CLOSED: 'door:closed',
  LOCKED: 'door:locked',
};

const HALF_CELL_SIZE = CELL_SIZE / 2;

const SHAKE_MULTIPLIER = 0.1;

export default class Door extends DynamicCell {
  constructor({
    key,
    interval,
    double,
    entrance = false,
    exit = false,
    active = true,
    ...other
  }) {
    super(other);

    this.timer = 0;
    this.keyCard = key;
    this.interval = interval;
    this.isDoor = true;
    this.active = active;
    this.double = double;
    this.entrance = entrance;
    this.exit = exit;
    this.isElevator = entrance || exit;

    this.setClosed();
  }

  use(user) {
    if (this.active && this.isClosed()) {
      if (this.keyCard && user.isPlayer) {
        const keyCard = user.keyCards[this.keyCard];

        if (keyCard && keyCard.isEquiped()) {
          if (this.setOpening()) {
            keyCard.use();
          }
        } else {
          user.addMessage(
            translate('world.door.locked', {
              color: translate(`world.color.${this.keyCard}`),
            })
          );
        }
      } else {
        this.setOpening();
      }
    }
  }

  update(delta, elapsedMS) {
    switch (this.state) {
      case STATES.OPENING: {
        this.updateOpening(delta, elapsedMS);
        break;
      }
      case STATES.CLOSING: {
        this.updateClosing(delta, elapsedMS);
        break;
      }
      case STATES.OPENED: {
        this.updateOpened(delta, elapsedMS);
        break;
      }
      default:
        break;
    }

    super.update(delta, elapsedMS);
  }

  updateOpening(delta) {
    const { axis, speed } = this;

    this.offset[axis] += speed * delta;

    if (this.offset[axis] > CELL_SIZE) {
      this.offset[axis] = CELL_SIZE;
      this.setOpened();
    }
  }

  updateClosing(delta) {
    const { axis, speed } = this;

    this.offset[axis] -= speed * 0.5 * delta;

    if (this.offset[axis] < 0) {
      if (this.entrance) {
        this.active = false;
      }

      this.offset[axis] = 0;
      this.setClosed();
    }
  }

  updateOpened(delta, elapsedMS) {
    if (this.timer) {
      this.timer -= elapsedMS;

      if (this.timer <= 0) {
        const blocked =
          this.parent
            .getNeighbourBodies(this)
            .some(body => body.isActor && body.isAlive()) ||
          this.bodies.some(b => b.isDynamic);

        if (!blocked) {
          this.timer = 0;
          this.setClosing();
        } else {
          this.timer = 1;
        }
      }
    }
  }

  setOpening() {
    const isStateChanged = this.setState(STATES.OPENING);

    if (isStateChanged) {
      this.startUpdates();
      this.emitSound(this.sounds.open);
    }

    return isStateChanged;
  }

  setOpened() {
    const isStateChanged = this.setState(STATES.OPENED);

    if (isStateChanged) {
      const distance = this.distanceToPlayer || CELL_SIZE;
      const shake = (CELL_SIZE / distance) * this.speed * SHAKE_MULTIPLIER;

      this.blocking = false;
      this.timer = this.interval;
      this.parent.player.shake(shake);
    }

    return isStateChanged;
  }

  setClosing() {
    const isStateChanged = this.setState(STATES.CLOSING);

    if (isStateChanged) {
      this.blocking = true;
      this.emitSound(this.sounds.close);
    }

    return isStateChanged;
  }

  setClosed() {
    const isStateChanged = this.setState(STATES.CLOSED);

    if (isStateChanged) {
      this.stopUpdates();
    }

    return isStateChanged;
  }

  isOpening() {
    return this.state === STATES.OPENING;
  }

  isOpened() {
    return this.state === STATES.OPENED;
  }

  isClosing() {
    return this.state === STATES.CLOSING;
  }

  isClosed() {
    return this.state === STATES.CLOSED;
  }

  get shape() {
    if (this.offset.x === CELL_SIZE || this.offset.y === CELL_SIZE) {
      if (this.axis === 'y') {
        const offsetX = this.reverse
          ? this.offset.x
          : CELL_SIZE - this.offset.x + this.width;

        return {
          x: this.x - HALF_CELL_SIZE + (CELL_SIZE - offsetX),
          y: this.y - HALF_CELL_SIZE + this.offset.y,
          width: this.width,
          length: this.length,
        };
      }

      const offsetY = this.reverse
        ? this.offset.y
        : CELL_SIZE - this.offset.y + this.length;

      return {
        x: this.x - HALF_CELL_SIZE + this.offset.x,
        y: this.y - HALF_CELL_SIZE + (CELL_SIZE - offsetY),
        width: this.width,
        length: this.length,
      };
    }

    return super.shape;
  }
}
