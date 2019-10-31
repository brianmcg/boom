import { DynamicBody, DynamicFlatSector } from '~/core/physics';
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

const DEFAULTS = {
  AXIS: 'x',
  SPEED: 1.5,
  INTERVAL: 2000,
};

/**
 * Class representing a door.
 * @extends {DynamicFlatSector}
 */
class Door extends DynamicFlatSector {
  /**
   * Creates a door sector
   * @param  {Number} options.x       The x coordinate of the sector.
   * @param  {Number} options.y       The y coordinate of the sector
   * @param  {Number} options.width   The width of the sector.
   * @param  {Number} options.length  The length of the sector.
   * @param  {Number} options.height  The height of the sector.
   * @param  {Object} options.sides   The ids of the sides of the sector.
   * @param  {String} options.axis    The axis of the door.
   * @param  {String} options.key     The key that unlocks the door.
   */
  constructor({
    key,
    sides,
    interval = DEFAULTS.INTERVAL,
    axis = DEFAULTS.AXIS,
    speed = DEFAULTS.SPEED,
    ...other
  }) {
    super({ ...other, axis, speed });

    this.timer = 0;
    this.key = key;
    this.interval = interval;

    this.closed = {
      x: this.x,
      y: this.y,
    };

    this.opened = {
      ...this.closed,
      [this.axis]: this[this.axis] + this.length,
    };

    this.front = sides.front;
    this.left = sides.left;
    this.back = sides.back;
    this.right = sides.right;
    this.bottom = sides.bottom;
    this.top = sides.top;
  }

  /**
   * Use the door.
   */
  use() {
    if (this.locked) {
      this.emit(EVENTS.LOCKED, this.key);
    } else {
      this.setState(STATES.OPENING);
    }
  }

  /**
   * Update the door.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    switch (this.state) {
      case STATES.OPENING: {
        this.updateOpening(delta);
        break;
      }
      case STATES.CLOSING: {
        this.updateClosing(delta);
        break;
      }
      case STATES.OPENED: {
        this.updateOpened(delta);
        break;
      }
      default:
        break;
    }
  }

  /**
   * Update the door when in opening state.
   * @param  {Number} delta The delta time.
   */
  updateOpening(delta) {
    const { axis, speed } = this;

    this[axis] += speed * delta;

    if (this[axis] >= this.opened[axis]) {
      this[axis] = this.opened[axis];
      this.setState(STATES.OPENED);
    }
  }

  /**
   * Update the door when in closing state.
   * @param  {Number} delta The delta time.
   */
  updateClosing(delta) {
    const { axis, speed } = this;

    this[axis] -= speed * delta;

    if (this[axis] <= this.closed[axis]) {
      this[axis] = this.closed[axis];
      this.setState(STATES.CLOSED);
    }
  }

  /**
   * Update the door when in opened state.
   * @param  {Number} delta The delta time.
   */
  updateOpened(delta) {
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
  }

  /**
   * Set the door state.
   * @param {String} state The door state.
   */
  setState(state) {
    switch (state) {
      case STATES.OPENED: {
        this.timer = this.interval;
        break;
      }
      default:
        break;
    }

    this.state = state;
  }

  /**
   * The door offset
   * @return {Number}
   */
  get offset() {
    const { closed, axis } = this;
    return this[axis] - closed[axis];
  }

  /**
   * The door events.
   * @static
   */
  static get EVENTS() {
    return EVENTS;
  }
}

export default Door;
