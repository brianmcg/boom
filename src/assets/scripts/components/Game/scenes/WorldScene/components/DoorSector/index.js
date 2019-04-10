import { Sector, DEG, SIN } from '~/core/physics';
import { TIME_STEP } from '~/constants/config';

const STATES = {
  OPENING: 'door:opening',
  OPENED: 'door:opened',
  CLOSING: 'door:closing',
  CLOSED: 'door:closed',
};

const EVENTS = {
  LOCKED: 'door:locked',
};

const SPEED = 2;

export default class DoorSector extends Sector {
  static get EVENTS() { return EVENTS; }

  constructor({ key, axis, ...other }) {
    super(other);
    this.key = key;
    this.axis = axis;
    this.angle = DEG[90];
    this.closed = { x: this.x, y: this.y };
    this.opened = { x: this.x, y: this.y - this.length };
    this.timer = 0;
  }

  setState(state) {
    switch (state) {
      case STATES.OPENING: {
        break;
      }
      case STATES.OPENED: {
        this.timer = 5000;
        break;
      }
      case STATES.CLOSING: {
        break;
      }
      case STATES.CLOSED: {
        break;
      }
      default: break;
    }

    this.state = state;
  }

  collide(body) {
    if (body instanceof Sector) {
      return false;
    }

    return super.collide(body);
  }

  use() {
    if (!this.locked) {
      this.setState(STATES.OPENING);
    } else {
      this.emit(EVENTS.LOCKED, '');
    }
  }

  update(delta) {
    switch (this.state) {
      case STATES.OPENING: {
        this.y += SIN[this.angle] * -SPEED * delta;

        if (this.y <= this.opened.y) {
          this.y = this.opened.y;
          this.setState(STATES.OPENED);
        }

        break;
      }
      case STATES.CLOSING: {
        this.y += SIN[this.angle] * SPEED * delta;

        if (this.y >= this.closed.y) {
          this.y = this.closed.y;
          this.setState(STATES.CLOSED);
        }

        break;
      }
      case STATES.OPENED: {
        if (this.timer) {
          this.timer -= TIME_STEP * delta;
          if (this.timer <= 0) {
            this.timer = 0;
            this.setState(STATES.CLOSING);
          }
        }

        break;
      }
      default: break;
    }
  }
}
