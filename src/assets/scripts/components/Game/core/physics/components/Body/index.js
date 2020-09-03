import { EventEmitter } from 'game/core/graphics';
import { CELL_SIZE } from 'game/constants/config';
import { isRayCollision, getRayCollision, getDistanceBetween } from '../../helpers';

const EVENTS = {
  ADDED: 'body:added',
  REMOVED: 'body:removed',
};

let idCount = 0;

const generateId = (body) => {
  idCount += 1;
  return `${body.constructor.name}_${idCount}`;
};

/**
 * Class representing a body.
 * @extends {EventEmitter}
 */
class Body extends EventEmitter {
  /**
   * Creates a body.
   * @param  {Number}  options.x         The x coordinate of the body.
   * @param  {Number}  options.y         The y coordinate of the body
   * @param  {Number}  options.width     The width of the body.
   * @param  {Number}  options.height    The height of the body.
   * @param  {Boolean} options.blocking. Is the body blocking.
   */
  constructor({
    x = 0,
    y = 0,
    z = 0,
    width = CELL_SIZE * 0.5,
    height = CELL_SIZE * 0.5,
    blocking = true,
  } = {}) {
    super();

    this.id = generateId(this);
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.height = height;
    this.blocking = blocking;
  }

  /**
   * Emit the added event.
   */
  emitAddedEvent() {
    this.emit(EVENTS.ADDED);
  }

  /**
   * Emit the removed event.
   */
  emitRemovedEvent() {
    this.emit(EVENTS.REMOVED);
  }

  /**
   * Add a callback for the added event.
   * @param  {Function} callback The callback function.
   */
  onAdded(callback) {
    this.on(EVENTS.ADDED, callback);
  }

  /**
   * Add a callback for the removed event.
   * @param  {Function} callback The callback function.
   */
  onRemoved(callback) {
    this.on(EVENTS.REMOVED, callback);
  }

  /**
   * Check for collision with a ray.
   * @param  {Object} ray The ray.
   * @return {Boolean}    Collision has occurred.
   */
  isRayCollision(ray) {
    return isRayCollision(this, ray);
  }

  /**
   * Get the coordinates of a ray collision.
   * @param  {Object} ray The ray.
   * @return {Object}     The collision coordinates.
   */
  getRayCollision(ray) {
    return getRayCollision(this, ray);
  }

  /**
   * Get the distance to another body.
   * @param  {Body} body The other body.
   * @return {Boolean}   The distance result.
   */
  getDistanceTo(body) {
    return getDistanceBetween(this, body);
  }

  /**
   * Destroy the body.
   */
  destroy() {
    this.removeAllListeners();
  }

  /**
   * Set the body state.
   * @param {String} state The new state.
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }

  /**
   * The grid x position.
   * @member {Number}
   */
  get gridX() {
    return Math.floor(this.x / CELL_SIZE);
  }

  /**
   * The grid y position.
   * @member {Number}
   */
  get gridY() {
    return Math.floor(this.y / CELL_SIZE);
  }

  /**
   * The shape of the body.
   * @member {Object}
   */
  get shape() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.width / 2,
      width: this.width,
    };
  }
}

export default Body;
