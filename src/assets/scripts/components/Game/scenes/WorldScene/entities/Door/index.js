import { TIME_STEP, CELL_SIZE } from 'game/constants/config';
import DynamicCell from '../DynamicCell';

const STATES = {
  OPENING: 'door:opening',
  OPENED: 'door:opened',
  CLOSING: 'door:closing',
  CLOSED: 'door:closed',
  LOCKED: 'door:locked',
};

/**
 * Class representing a door.
 * @extends {DynamicCell}
 */
class Door extends DynamicCell {
  /**
   * Creates a door cell
   * @param  {Number} options.x       The x coordinate of the cell.
   * @param  {Number} options.y       The y coordinate of the cell
   * @param  {Number} options.width   The width of the cell.
   * @param  {Number} options.height  The height of the cell.
   * @param  {Object} options.sides   The ids of the sides of the cell.
   * @param  {String} options.axis    The axis of the door.
   * @param  {String} options.key     The key that unlocks the door.
   */
  constructor({ key, interval, ...other }) {
    super(other);

    this.timer = 0;
    this.keyCard = key;
    this.interval = interval;

    if (this.isHorizontal()) {
      this.offset.y = CELL_SIZE / 2;
    }

    if (this.isVertical()) {
      this.offset.x = CELL_SIZE / 2;
    }

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

    super.update(delta);
  }

  /**
   * Update the door when in opening state.
   * @param  {Number} delta The delta time.
   */
  updateOpening(delta) {
    const { axis, speed } = this;

    this.offset[axis] += speed * delta;

    if (this.offset[axis] > CELL_SIZE) {
      this.offset[axis] = CELL_SIZE;
      this.setOpened();
    }
  }

  /**
   * Update the door when in closing state.
   * @param  {Number} delta The delta time.
   */
  updateClosing(delta) {
    const { axis, speed } = this;

    this.offset[axis] -= speed * 0.5 * delta;

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
        const blocked = this.parent.getAdjacentBodies(this).some(body => (
          body.isActor && body.isAlive()
        )) || this.bodies.some(b => b.isDynamicBody);

        if (!blocked) {
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
    const isStateChanged = this.setState(STATES.OPENING);

    if (isStateChanged) {
      this.emitSound(this.sounds.open);
    }

    return isStateChanged;
  }

  /**
   * Set the door to the opened state.
   */
  setOpened() {
    const isStateChanged = this.setState(STATES.OPENED);

    if (isStateChanged) {
      const { player } = this.parent;
      const force = this.speed * 2;

      this.blocking = false;
      this.timer = this.interval;

      player.shake(force);
    }

    return isStateChanged;
  }

  /**
   * Set the door to the closing state.
   * @return {Boolean} State change successful.
   */
  setClosing() {
    const isStateChanged = this.setState(STATES.CLOSING);

    if (isStateChanged) {
      this.blocking = true;

      this.emitSound(this.sounds.close);
    }

    return isStateChanged;
  }

  /**
   * Set the door to the closed state.
   */
  setClosed() {
    return this.setState(STATES.CLOSED);
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
}

export default Door;
