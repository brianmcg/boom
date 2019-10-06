import { Sector, DynamicBody } from '~/core/physics';
import { TIME_STEP } from '~/constants/config';
import { STATES, EVENTS, DEFAULTS } from './constants';

class Door extends Sector {
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
    const {
      key,
      axis = DEFAULTS.AXIS,
      speed = DEFAULTS.SPEED,
      waitTime = DEFAULTS.WAIT_TIME,
      ...other
    } = options;

    super(other);

    this.timer = 0;
    this.key = key;
    this.axis = axis;
    this.speed = speed;
    this.waitTime = waitTime;

    this.closed = {
      x: this.x,
      y: this.y,
    };

    this.opened = {
      ...this.closed,
      [axis]: this[axis] + this.length,
    };
  }

  setState(state) {
    switch (state) {
      case STATES.OPENED: {
        this.timer = this.waitTime;
        break;
      }
      default: break;
    }

    this.state = state;
  }

  use() {
    if (this.locked) {
      this.emit(EVENTS.LOCKED, this.key);
    } else {
      this.setState(STATES.OPENING);
    }
  }

  update(delta) {
    const { axis, state, speed } = this;

    switch (state) {
      case STATES.OPENING: {
        this[axis] += speed * delta;

        if (this[axis] >= this.opened[axis]) {
          this[axis] = this.opened[axis];
          this.setState(STATES.OPENED);
        }

        break;
      }
      case STATES.CLOSING: {
        this[axis] -= speed * delta;

        if (this[axis] <= this.closed[axis]) {
          this[axis] = this.closed[axis];
          this.setState(STATES.CLOSED);
        }

        break;
      }
      case STATES.OPENED: {
        if (this.timer) {
          this.timer -= TIME_STEP * delta;
          if (this.timer <= 0) {
            const isBlocked = this.world.getAdjacentBodies(this)
              .reduce((result, body) => (result || body instanceof DynamicBody), false);

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

  get offset() {
    const { closed, axis } = this;
    return this[axis] - closed[axis];
  }
}

export default Door;
