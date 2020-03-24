import { EventEmitter } from 'game/core/graphics';
import { CELL_SIZE } from 'game/constants/config';
import {
  isBodyCollision,
  isRayCollision,
  castRay,
  distanceBetween,
} from '../../helpers';

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
   * @param  {Number}  options.length    The length of the body.
   * @param  {Number}  options.height    The height of the body.
   * @param  {Boolean} options.blocking. Is the body blocking.
   */
  constructor({
    x = 0,
    y = 0,
    width = CELL_SIZE / 2,
    length = CELL_SIZE / 2,
    height = CELL_SIZE / 2,
    blocking = true,
  } = {}) {
    super();

    this.id = generateId(this);
    this.x = x;
    this.y = y;
    this.width = width;
    this.length = length;
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
  onAddedEvent(callback) {
    this.on(EVENTS.ADDED, callback);
  }

  /**
   * Add a callback for the removed event.
   * @param  {Function} callback The callback function.
   */
  onRemovedEvent(callback) {
    this.on(EVENTS.REMOVED, callback);
  }


  /**
   * Check for collision with another body.
   * @param  {Body}    body The other body.
   * @return {Boolean}      Collision has occurred.
   */
  bodyCollision(body) {
    return isBodyCollision(this, body);
  }

  /**
   * Check for collision with a ray.
   * @param  {Object} ray The ray.
   * @return {Boolean}    Collision has occurred.
   */
  rayCollision(ray) {
    return isRayCollision(this, ray);
  }

  /**
   * Cast a ray.
   * @param  {Number} rayAngle  Optional ray angle.
   * @return {Ray}              The resulting ray.
   */
  castRay(rayAngle) {
    return castRay(this, rayAngle);
  }

  /**
   * Get the distance to another body.
   * @param  {Body} body The other body.
   * @return {Boolean}   The distance result.
   */
  distanceTo(body) {
    return distanceBetween(this, body);
  }

  /**
   * Destroy the body.
   */
  destroy() {
    this.removeAllListeners();
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
      y: this.y - this.length / 2,
      width: this.width,
      length: this.length,
    };
  }
}

export default Body;
