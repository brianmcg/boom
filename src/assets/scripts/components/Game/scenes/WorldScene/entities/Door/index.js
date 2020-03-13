import translate from 'root/translate';
import { DynamicSector } from 'game/core/physics';
import { TIME_STEP, TILE_SIZE } from 'game/constants/config';

const STATES = {
  OPENING: 'door:opening',
  OPENED: 'door:opened',
  CLOSING: 'door:closing',
  CLOSED: 'door:closed',
  LOCKED: 'door:locked',
};

/**
 * Class representing a door.
 * @extends {DynamicSector}
 */
class Door extends DynamicSector {
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
    interval,
    axis,
    ...other
  }) {
    super({ ...other, axis });

    this.timer = 0;
    this.keyCard = key;
    this.interval = interval;

    if (this.isHorizontal()) {
      this.offset.y = TILE_SIZE / 2;
    }

    if (this.isVertical()) {
      this.offset.x = TILE_SIZE / 2;
    }

    this.front = sides.front;
    this.left = sides.left;
    this.back = sides.back;
    this.right = sides.right;
    this.bottom = sides.bottom;
    this.top = sides.top;
    this.isDoor = true;

    this.setClosed();
  }

  /**
   * Open the door.
   * @return {Booleam}
   */
  open() {
    if (this.isClosed()) {
      return this.setOpening();
    }

    return false;
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

    this.offset[axis] += speed * delta;

    if (this.offset[axis] > TILE_SIZE) {
      this.offset[axis] = TILE_SIZE;
      this.setOpened();
    }
  }

  /**
   * Update the door when in closing state.
   * @param  {Number} delta The delta time.
   */
  updateClosing(delta) {
    const { axis, speed } = this;

    this.offset[axis] -= speed * delta;

    if (this.offset[axis] < 0) {
      this.offset[axis] = 0;
      this.setClosed();
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
          .some(body => body.isDynamicBody);

        if (!isBlocked) {
          this.timer = 0;
          this.setClosing();
        } else {
          this.timer = 1;
        }
      }
    }
  }

  /**
   * Set the door to the opening state.
   */
  setOpening() {
    this.setState(STATES.OPENING);
  }

  /**
   * Set the door to the opened state.
   */
  setOpened() {
    const { player } = this.world;
    const force = this.speed * 1.5;

    if (this.setState(STATES.OPENED)) {
      this.blocking = false;
      player.shake(force);
      this.timer = this.interval;
    }
  }

  /**
   * Set the door to the closing state.
   */
  setClosing() {
    this.blocking = true;
    this.setState(STATES.CLOSING);
  }

  /**
   * Set the door to the closed state.
   */
  setClosed() {
    this.setState(STATES.CLOSED);
  }

  /**
   * Is the door opening.
   * @return {Boolean}
   */
  isOpening() {
    return this.state === STATES.OPENING;
  }

  /**
   * Is the door opened.
   * @return {Boolean}
   */
  isOpened() {
    return this.state === STATES.OPENED;
  }

  /**
   * Is the door closing.
   * @return {Boolean}
   */
  isClosing() {
    return this.state === STATES.CLOSING;
  }

  /**
   * Is the door closed.
   * @return {Boolean}
   */
  isClosed() {
    return this.state === STATES.CLOSED;
  }

  /**
   * Set the door state.
   * @param {String} state The door state.
   */
  setState(state) {
    const stateChanged = this.state !== state;

    if (stateChanged) {
      this.state = state;
    }

    return stateChanged;
  }
}

export default Door;
