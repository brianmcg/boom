import { CELL_SIZE } from 'game/constants/config';
import Body from '../Body';
import {
  isBodyCollision,
  getAngleBetween,
  castRay,
  isFacing,
} from '../../helpers';

const EVENTS = {
  COLLISION_START: 'body:collision:start',
  COLLISION_END: 'body:collision:end',
};

/**
 * Class representing a dynamic body.
 * @extends {Body}
 */
class DynamicBody extends Body {
  /**
   * Creates a dynamic body.
   * @param  {Number}  options.x        The x coordinate of the dynamic body.
   * @param  {Number}  options.y        The y coordinate of the dynamic body
   * @param  {Number}  options.width    The width of the dynamic body.
   * @param  {Number}  options.height   The height of the dynamic body.
   * @param  {Boolean} options.blocking Is the body blocking.
   * @param  {Number}  options.angle    The angle of the dynamic body.
   */
  constructor({ angle = 0, weight = 1, ...other } = {}) {
    super(other);

    this.velocity = 0;
    this.angle = angle;
    this.isDynamicBody = true;
    this.weight = weight;
    this.collisions = [];
    this.trackedCollisions = [];
  }

  /**
   * Initialize the entity.
   */
  initialize(parent) {
    this.parent = parent;
    this.cell = parent.getCell(this.gridX, this.gridY);
  }

  /**
   * Add a callback for the collision event.
   * @param  {Function} callback The callback function.
   */
  onCollision(callback) {
    this.on(EVENTS.COLLISION, callback);
  }

  /**
   * Add a callback for the collision start event.
   * @param  {Function} callback The callback function.
   */
  onCollisionStart(callback) {
    this.on(EVENTS.COLLISION_START, callback);
  }

  /**
   * Add a callback for the collision end event.
   * @param  {Function} callback The callback function.
   */
  onCollisionEnd(callback) {
    this.on(EVENTS.COLLISION_END, callback);
  }

  /**
   * Check for collision with another body.
   * @param  {Body}    body The other body.
   * @return {Boolean}      Collision has occurred.
   */
  isBodyCollision(body) {
    return !(!this.weight && body.bars)
      && isBodyCollision(this, body);
  }

  /**
   * Update the dynamic body.
   * @param  {Number} delta The delta time value.
   */
  update(delta) {
    // Get bodies from surrounding cells
    const bodies = this.parent.getAdjacentBodies(this);

    const collisions = [];

    const velocity = Math.min(this.velocity * delta, CELL_SIZE / 2);

    // Unmark id from cell before moving
    this.cell.remove(this);

    // Update x coordinate
    this.x += Math.cos(this.angle) * velocity;

    // Check for x axis collisions
    bodies.forEach((body) => {
      if (this.isBodyCollision(body)) {
        if (this.isCollisionTracked(body)) {
          collisions.push(body);
        }

        if (body.blocking) {
          if (body.x > this.x) {
            this.x = (body.x - (body.width / 2)) - (this.width / 2);
          } else {
            this.x = body.x + (body.width / 2) + (this.width / 2);
          }
        }
      }
    });

    // Update y coordinate
    this.y += Math.sin(this.angle) * velocity;

    // Check for y axis collisions
    bodies.forEach((body) => {
      if (this.isBodyCollision(body)) {
        if (this.isCollisionTracked(body) && !collisions.includes(body)) {
          collisions.push(body);
        }

        if (body.blocking) {
          if (body.y > this.y) {
            this.y = (body.y - (body.width / 2)) - (this.width / 2);
          } else {
            this.y = body.y + (body.width / 2) + (this.width / 2);
          }
        }
      }
    });

    this.trackedCollisions.forEach(({ type, onStart, onComplete }) => {
      if (onStart) {
        collisions.forEach((c) => {
          if (c instanceof type && !this.collisions.includes(c)) {
            onStart(c);
          }
        });
      }

      if (onComplete) {
        this.collisions.forEach((c) => {
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

  /**
   * Cast a ray.
   * @param  {Number} rayAngle  Optional ray angle.
   * @return {Ray}              The resulting ray.
   */
  castRay(rayAngle) {
    const rays = castRay({
      x: this.x,
      y: this.y,
      angle: rayAngle === undefined ? this.angle : rayAngle,
      world: this.parent,
    });

    return rays[rays.length - 1];
  }

  /**
   * Check if the body is facing another
   * @param  {Body}  body The body.
   * @return {Boolean}    The check is confirmed.
   */
  isFacing(body) {
    return isFacing(this, body);
  }

  /**
   * Add a collision type to track.
   * @param {Class}     options.type       The type of collision to track.
   * @param {Function}  options.onStart    The cllback to trigger on collision start.
   * @param {Function}  options.onComplete The callback to trigger on collision complete.
   */
  addTrackedCollision(options) {
    this.trackedCollisions.push(options);
  }

  /**
   * Is a collision with this body tracked.
   * @param  {Body}  body The body to check.
   * @return {Boolean}
   */
  isCollisionTracked(body) {
    return this.trackedCollisions.some(({ type }) => body instanceof type);
  }

  /**
   * Get angle to a body.
   * @param  {Body} body The body.
   * @return {Number}    The angle to the body.
   */
  getAngleTo(body) {
    return getAngleBetween(this, body);
  }
}

export default DynamicBody;
