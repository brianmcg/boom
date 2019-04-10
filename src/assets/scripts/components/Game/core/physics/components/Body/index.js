import { EventEmitter } from '~/core/graphics';
import { TILE_SIZE } from '~/constants/config';

let idCount = 0;

/**
 * Class representing a body.
 * @extends {EventEmitter}
 */
export default class Body extends EventEmitter {
  /**
   * Creates a body.
   * @param  {Number} options.x      The x coordinate of the body.
   * @param  {Number} options.y      The y coordinate of the body
   * @param  {Number} options.width  The width of the body.
   * @param  {Number} options.length The length of the body.
   * @param  {Number} options.height The height of the body.
   */
  constructor(options = {}) {
    super();

    const {
      x = 0,
      y = 0,
      width = 0,
      length = 0,
      height = 0,
    } = options;

    idCount += 1;

    this.id = `${this.constructor.name}_${idCount}`;
    this.x = x;
    this.y = y;
    this.width = width;
    this.length = length;
    this.height = height;
  }

  /**
   * Check if this body is blocking.
   * @return {Boolean}
   */
  blocking(body) {
    if (body) {
      return body.blocking() && !!this.height;
    }
    return this.height;
  }

  /**
   * Check if this body is colliding with another.
   * @param  {Body}     body The other body to check.
   * @return {Boolean}
   */
  collide(body) {
    const thisShape = this.shape;
    const otherShape = body.shape;

    return thisShape.x < otherShape.x + otherShape.width
      && thisShape.x + thisShape.width > otherShape.x
      && thisShape.y < otherShape.y + otherShape.length
      && thisShape.length + thisShape.y > otherShape.y;
  }

  /**
   * The grid x position.
   * @member {Number}
   */
  get gridX() {
    return Math.floor(this.x / TILE_SIZE);
  }

  /**
   * The grid y position.
   * @member {Number}
   */
  get gridY() {
    return Math.floor(this.y / TILE_SIZE);
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
