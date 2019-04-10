import { DynamicSector, DEG } from '~/core/physics';
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

export default class DoorSector extends DynamicSector {
  static get EVENTS() { return EVENTS; }

  constructor({ key, axis, ...other }) {
    super(other);
    this.key = key;
    this.axis = axis;
    this.angle = DEG[90];
    // this.setState(STATES.OPENING);
    this.closed = { x: this.x, y: this.y };
    this.opened = { x: this.x, y: this.y - this.length };
    this.timer = 0;
    this.velocity = -SPEED;
  }

  setState(state) {
    switch (state) {
      case STATES.OPENING: {
        this.velocity = -2;
        break;
      }
      case STATES.OPENED: {
        this.velocity = 0;
        this.timer = 5000;
        break;
      }
      case STATES.CLOSING: {
        this.velocity = 2;
        break;
      }
      case STATES.CLOSED: {
        this.velocity = 0;
        break;
      }
      default: break;
    }

    this.state = state;
  }

  collide(body) {
    return false;
  }

  open() {
    if (!this.locked) {
      this.state = STATES.OPENING;
    } else {
      this.emit(EVENTS.LOCKED, '');
    }
  }

  // update(delta, ...other) {
  //   // console.log(this.x, this.y);
  //   switch (this.state) {
  //     case STATES.OPENING: {
  //       super.update(delta, ...other);

  //       if (this.y <= this.opened.y) {
  //         this.y = this.opened.y;
  //         this.state = STATES.OPENED;
  //       }

  //       break;
  //     }
  //     case STATES.CLOSING: {
  //       super.update(delta, ...other);

  //       if (this.y >= this.closed.y) {
  //         this.y = this.closed.y;
  //         this.state = STATES.CLOSED;
  //       }

  //       break;
  //     }
  //     case STATES.OPENED: {
  //       if (this.timer) {
  //         this.timer -= TIME_STEP * delta;

  //         if (this.timer <= 0) {
  //           this.timer = 0;
  //           this.state = STATES.CLOSING;
  //         }
  //       }

  //       break;
  //     }
  //     default: break;
  //   }
  // }
}
