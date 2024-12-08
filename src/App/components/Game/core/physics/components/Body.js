import { EventEmitter } from '@game/core/graphics';
import { CELL_SIZE } from '@constants/config';
import {
  isRayCollision,
  getRayCollision,
  getDistanceBetween,
} from '../helpers';

let idCount = 0;

const generateId = body => {
  idCount += 1;
  return `${body.constructor.name}_${idCount}`;
};

export default class Body extends EventEmitter {
  constructor({
    x = 0,
    y = 0,
    z = 0,
    width = CELL_SIZE * 0.5,
    length = CELL_SIZE * 0.5,
    height = CELL_SIZE * 0.5,
    blocking = true,
    anchor = 1,
  } = {}) {
    super();

    this.id = generateId(this);
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.length = length;
    this.height = height;
    this.blocking = blocking;
    this.anchor = anchor;
  }

  setPos({ x = 0, y = 0, z = 0 }) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  removeFromParent() {
    if (this.parent) {
      this.parent.remove(this);
      this.parent = null;
    }
  }

  isRayCollision(ray) {
    return isRayCollision(this, ray);
  }

  getRayCollision(ray) {
    return getRayCollision(this, ray);
  }

  getDistanceTo(body) {
    return getDistanceBetween(this, body);
  }

  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }

  destroy() {
    this.removeFromParent();
    this.removeAllListeners();
  }

  get elavation() {
    return this.z;
  }

  get gridX() {
    return Math.floor(this.x / CELL_SIZE);
  }

  get gridY() {
    return Math.floor(this.y / CELL_SIZE);
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
