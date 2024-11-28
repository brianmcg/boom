import { CELL_SIZE } from '@constants/config';
import Body from './Body';
import { TRANSPARENCY } from '../constants';
import {
  isBodyCollision,
  getAngleBetween,
  castRay,
  isFacing,
} from '../helpers';

const EVENTS = {
  COLLISION_START: 'body:collision:start',
  COLLISION_END: 'body:collision:end',
};

const VELOCITY_LIMIT = CELL_SIZE / 2;

const { FULL } = TRANSPARENCY;

export default class DynamicBody extends Body {
  constructor({ angle = 0, weight = 1, autoPlay = true, ...other } = {}) {
    super(other);

    this.velocity = 0;
    this.angle = angle;
    this.isDynamic = true;
    this.weight = weight;
    this.collisions = [];
    this.trackedCollisions = [];
    this.autoPlay = autoPlay;
    this.collisionRadius = Math.ceil(this.width / CELL_SIZE);
  }

  onAdded(parent) {
    this.parent = parent;
    this.cell = parent.getCell(this.gridX, this.gridY);
  }

  onRemoved() {
    this.parent = null;
    this.cell = null;
  }

  onCollision(callback) {
    this.on(EVENTS.COLLISION, callback);
  }

  onCollisionStart(callback) {
    this.on(EVENTS.COLLISION_START, callback);
  }

  onCollisionEnd(callback) {
    this.on(EVENTS.COLLISION_END, callback);
  }

  isBodyCollision(body) {
    return !(!this.weight && body.transparency) && isBodyCollision(this, body);
  }

  update(delta) {
    // Get bodies from surrounding cells
    const bodies = this.parent.getNeighbourBodies(this, this.collisionRadius);

    const collisions = [];

    const velocity = Math.min(this.velocity * delta, VELOCITY_LIMIT);

    this.previousPos = {
      x: this.x,
      y: this.y,
    };

    // Unmark id from cell before moving
    this.cell.remove(this);

    // Update x coordinate
    this.x += Math.cos(this.angle) * velocity;

    // Check for x axis collisions
    bodies.forEach(body => {
      if (this.isBodyCollision(body)) {
        if (this.isCollisionTracked(body)) {
          collisions.push(body);
        }

        if (body.blocking && body.transparency !== FULL) {
          const { shape } = body;
          const { x, width } = shape;
          const halfWidth = this.shape.width / 2;

          if (this.previousPos.x < shape.x) {
            this.x = x - halfWidth - 0.0001;
          } else {
            this.x = x + width + halfWidth;
          }
        }
      }
    });

    // Update y coordinate
    this.y += Math.sin(this.angle) * velocity;

    // Check for y axis collisions
    bodies.forEach(body => {
      if (this.isBodyCollision(body)) {
        if (this.isCollisionTracked(body) && !collisions.includes(body)) {
          collisions.push(body);
        }

        if (body.blocking && body.transparency !== FULL) {
          const { shape } = body;
          const { y, length } = shape;
          const halfLength = this.shape.length / 2;

          if (this.previousPos.y < shape.y) {
            this.y = y - halfLength - 0.0001;
          } else {
            this.y = y + length + halfLength;
          }
        }
      }
    });

    this.trackedCollisions.forEach(({ type, onStart, onComplete }) => {
      if (onStart) {
        collisions.forEach(c => {
          if (c instanceof type && !this.collisions.includes(c)) {
            onStart(c);
          }
        });
      }

      if (onComplete) {
        this.collisions.forEach(c => {
          if (c instanceof type && !collisions.includes(c)) {
            onComplete(c);
          }
        });
      }
    });

    this.collisions = collisions;

    // Mark current cell with id
    this.cell = this.parent.getCell(this.gridX, this.gridY);
    this.cell.add(this);
  }

  castRay(rayAngle) {
    const rays = castRay({
      x: this.x,
      y: this.y,
      angle: rayAngle === undefined ? this.angle : rayAngle,
      world: this.parent,
    });

    return rays[rays.length - 1];
  }

  startUpdates() {
    if (this.parent) {
      this.parent.startUpdates(this);
    }
  }

  stopUpdates() {
    if (this.parent) {
      this.parent.stopUpdates(this);
    }
  }

  isFacing(body) {
    return isFacing(this, body);
  }

  addTrackedCollision(options) {
    this.trackedCollisions.push(options);
  }

  isCollisionTracked(body) {
    return this.trackedCollisions.some(c => body instanceof c.type);
  }

  getAngleTo(body) {
    return getAngleBetween(this, body);
  }
}
