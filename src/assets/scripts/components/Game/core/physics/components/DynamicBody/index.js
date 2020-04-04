import Body from '../Body';
import { COS, SIN, DEG } from '../../constants';
import { isFacing } from '../../helpers';

const DEG_360 = DEG[360];

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
    this.rotVelocity = 0;
    this.angle = angle;
    this.isDynamicBody = true;
  }

  /**
   * Update the dynamic body.
   * @param  {Number} delta The delta time value.
   */
  update(delta) {
    // Get bodies from surrounding cells
    const bodies = this.parent.getAdjacentBodies(this);

    // Unmark id from cell before moving
    this.parent.getCell(this.gridX, this.gridY).remove(this);

    // Update angle
    this.angle = (this.angle + Math.round(this.rotVelocity * delta) + DEG_360) % DEG_360;

    // Update x coordinate
    this.x += COS[this.angle] * this.velocity * delta;

    // Check for x axis collisions
    bodies.forEach((body) => {
      if (body.blocking && this.isBodyCollision(body)) {
        if (body.x > this.x) {
          this.x = (body.x - (body.width / 2)) - (this.width / 2);
        } else {
          this.x = body.x + (body.width / 2) + (this.width / 2);
        }
      }
    });

    // Update y coordinate
    this.y += SIN[this.angle] * this.velocity * delta;

    // Check for y axis collisions
    bodies.forEach((body) => {
      if (body.blocking && this.isBodyCollision(body)) {
        if (body.y > this.y) {
          this.y = (body.y - (body.width / 2)) - (this.width / 2);
        } else {
          this.y = body.y + (body.width / 2) + (this.width / 2);
        }
      }
    });

    // Mark current cell with id
    this.parent.getCell(this.gridX, this.gridY).add(this);
  }

  /**
   * Check if the body is facing another
   * @param  {Body}  body The body.
   * @return {Boolean}    The check is confirmed.
   */
  isFacing(body) {
    return isFacing(this, body);
  }
}

export default DynamicBody;
