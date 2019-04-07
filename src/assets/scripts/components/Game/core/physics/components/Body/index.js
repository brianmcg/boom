import { EventEmitter } from '~/core/graphics';
import { TILE_SIZE } from '~/constants/config';

let idCount = 0;

/**
 * Class representing a body.
 */
export default class Body extends EventEmitter {
  constructor(options) {
    super();

    const {
      x = 0,
      y = 0,
      width = 0,
      length = 0,
      height = 0,
      angle = 0,
    } = options;

    idCount += 1;

    this.id = `${this.name}_${idCount}`;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.width = width;
    this.length = length;
    this.height = height;
  }

  isBlocking() {
    return !!this.height;
  }

  get name() {
    return this.constructor.name;
  }

  get gridX() {
    return Math.floor(this.x / TILE_SIZE);
  }

  get gridY() {
    return Math.floor(this.y / TILE_SIZE);
  }

  get shape() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.length / 2,
      width: this.width,
      length: this.length,
    };
  }
}
