import translate from '@translate';
import { CELL_SIZE } from '@game/constants/config';
import DynamicCell from '../DynamicCell';

const STATES = {
  OPENING: 'door:opening',
  OPENED: 'door:opened',
  CLOSING: 'door:closing',
  CLOSED: 'door:closed',
  LOCKED: 'door:locked',
};

const HALF_CELL_SIZE = CELL_SIZE / 2;

const SHAKE_MULTIPLIER = 0.1;

/**
 * Class representing a door.
 * @extends {DynamicCell}
 */
class Door extends DynamicCell {
  /**
   * Creates a door cell
   * @param  {Number}  options.x            The x coordinate of the door.
   * @param  {Number}  options.y            The y coordinate of the door.
   * @param  {Number}  options.z            The z coordinate of the door.
   * @param  {Number}  options.width        The width of the door.
   * @param  {Number}  options.height       The length of the door.
   * @param  {Number}  options.height       The height of the door.
   * @param  {Boolean} options.blocking     The blocking value of the door.
   * @param  {Number}  options.anchor       The anchor of the door.
   * @param  {String}  options.axis         The anchor of the door.
   * @param  {Number}  options.offset       The offset of the door.
   * @param  {Boolean} options.autoPlay     The cell autoPlay value.
   * @param  {Object}  options.sides        The sides of the door.
   * @param  {Sound}   options.soundSprite  The soundSprite.
   * @param  {Object}  options.sounds       The sounds.
   * @param  {Boolean} options.reverse      Reverse the offset.
   * @param  {String}  options.key          The key that unlocks the door.
   * @param  {Number}  options.interval     The time the door remains open.
   * @param  {Boolean} options.double       Double door options.
   * @param  {Boolean} options.entrance     Entrance door option.
   * @param  {Boolean} options.exit         Exit door option.
   * @param  {Boolean} options.active       Active door option.
   */
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

  /**
   * Open the door.
   * @param  {AbstractActor} user The user of the door.
   */
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
            }),
          );
        }
      } else {
        this.setOpening();
      }
    }
  }

  /**
   * Update the door.
   * @param  {Number} delta     The delta time.
   * @param  {Number} elapsedMS The elapsed time in milliseconds.
   */
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
      if (this.entrance) {
        this.active = false;
      }

      this.offset[axis] = 0;
      this.setClosed();
    }
  }

  /**
   * Update the door when in opened state.
   * @param  {Number} delta The delta time.
   * @param  {Number} elapsedMS The elapsed time in milliseconds.
   */
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

  /**
   * Set the door to the opening state.
   * @return {Boolean} State change successful.
   */
  setOpening() {
    const isStateChanged = this.setState(STATES.OPENING);

    if (isStateChanged) {
      this.startUpdates();
      this.emitSound(this.sounds.open);
    }

    return isStateChanged;
  }

  /**
   * Set the door to the opened state.
   * @return {Boolean} State change successful.
   */
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
   * @return {Boolean} State change successful.
   */
  setClosed() {
    const isStateChanged = this.setState(STATES.CLOSED);

    if (isStateChanged) {
      this.stopUpdates();
    }

    return isStateChanged;
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
   * Get the shape of the door.
   * @return {Object} The door shape properties.
   */
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

export default Door;
