import { CELL_SIZE } from 'game/constants/config';
import Body from '../Body';
import {
  isBodyCollision,
  degrees,
  getAngleBetween,
  castRay,
} from '../../helpers';

const DEG_360 = degrees(360);

const DEG_270 = degrees(270);

const DEG_90 = degrees(90);

const EVENTS = {
  COLLISION: 'body:collision',
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
  constructor({ angle = 0, ...other } = {}) {
    super(other);

    this.velocity = 0;
    this.angle = angle;
    this.isDynamicBody = true;
  }

  /**
   * Add a callback for the collision event.
   * @param  {Function} callback The callback function.
   */
  onCollision(callback) {
    this.on(EVENTS.COLLISION, callback);
  }

  /**
   * Check for collision with another body.
   * @param  {Body}    body The other body.
   * @return {Boolean}      Collision has occurred.
   */
  isBodyCollision(body) {
    return isBodyCollision(this, body);
  }

  /**
   * Update the dynamic body.
   * @param  {Number} delta The delta time value.
   */
  update(delta) {
    // Get bodies from surrounding cells
    const bodies = this.parent.getAdjacentBodies(this);

    const velocity = Math.min(this.velocity * delta, CELL_SIZE / 2);

    // Unmark id from cell before moving
    this.parent.getCell(this.gridX, this.gridY).remove(this);

    // Update x coordinate
    this.x += Math.cos(this.angle) * velocity;

    // Check for x axis collisions
    bodies.forEach((body) => {
      if (this.isBodyCollision(body)) {
        this.emit(EVENTS.COLLISION, body);

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
        this.emit(EVENTS.COLLISION, body);

        if (body.blocking) {
          if (body.y > this.y) {
            this.y = (body.y - (body.width / 2)) - (this.width / 2);
          } else {
            this.y = body.y + (body.width / 2) + (this.width / 2);
          }
        }
      }
    });

    // Mark current cell with id
    this.parent.getCell(this.gridX, this.gridY).add(this);
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
   * Check if the body is facing another
   * @param  {Body}  body The body.
   * @return {Boolean}    The check is confirmed.
   */
  isFacing(body) {
    const angle = (this.getAngleTo(body) - this.angle + DEG_360) % DEG_360;
    return angle > DEG_270 || angle < DEG_90;
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
