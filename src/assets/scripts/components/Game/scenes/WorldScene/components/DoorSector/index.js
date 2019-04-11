import { Sector, DynamicBody } from '~/core/physics';
import { TIME_STEP } from '~/constants/config';
import { STATES, EVENTS, AXIS } from './constants';

const SPEED = 2;

const WAIT_TIME = 5000;

export default class DoorSector extends Sector {
  static get EVENTS() { return EVENTS; }

  /**
   * Creates a door sector
   * @param  {Number} options.x       The x coordinate of the sector.
   * @param  {Number} options.y       The y coordinate of the sector
   * @param  {Number} options.width   The width of the sector.
   * @param  {Number} options.length  The length of the sector.
   * @param  {Number} options.height  The height of the sector.
   * @param  {Array}  options.sideIds The ids of the sides of the sector.
   * @param  {String} options.axis    The axis of the door.
   * @param  {String} options.key     The key that unlocks the door.
   */
  constructor(options) {
    const { key, axis = AXIS.X, ...other } = options;

    super(other);

    const axisLength = axis === AXIS.X
      ? this.width
      : this.length;

    this.timer = 0;
    this.key = key;
    this.axis = axis;

    this.closed = {
      x: this.x,
      y: this.y,
    };

    this.opened = {
      ...this.closed,
      [axis]: this[axis] - axisLength,
    };
  }

  setState(state) {
    switch (state) {
      case STATES.OPENED: {
        this.timer = WAIT_TIME;
        break;
      }
      default: break;
    }

    this.state = state;
  }

  use() {
    if (!this.locked) {
      this.setState(STATES.OPENING);
    } else {
      this.emit(EVENTS.LOCKED, this.key);
    }
  }

  update(delta) {
    const { axis, state } = this;

    switch (state) {
      case STATES.OPENING: {
        this[axis] -= SPEED * delta;

        if (this[axis] <= this.opened[axis]) {
          this[axis] = this.opened[axis];
          this.setState(STATES.OPENED);
        }

        break;
      }
      case STATES.CLOSING: {
        this[axis] += SPEED * delta;

        if (this[axis] >= this.closed[axis]) {
          this[axis] = this.closed[axis];
          this.setState(STATES.CLOSED);
        }

        break;
      }
      case STATES.OPENED: {
        if (this.timer) {
          this.timer -= TIME_STEP * delta;
          if (this.timer <= 0) {
            const isBlocked = this.world.adjacentBodies(this)
              .reduce((result, body) => (
                result || body instanceof DynamicBody
              ), false);

            if (!isBlocked) {
              this.timer = 0;
              this.setState(STATES.CLOSING);
            } else {
              this.timer = 1;
            }
          }
        }

        break;
      }
      default: break;
    }
  }
}
