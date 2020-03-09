import Body from '../Body';
import { COS, SIN, DEG } from '../../constants';

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
   * @param  {Number}  options.length   The length of the dynamic body.
   * @param  {Number}  options.height   The height of the dynamic body.
   * @param  {Boolean} options.blocking Is the body blocking.
   * @param  {Number}  options.angle    The angle of the dynamic body.
   */
  constructor({ angle = 0, ...other } = {}) {
    super(other);

    this.velocity = 0;
    this.rotVelocity = 0;
    this.angle = angle;
  }

  /**
   * Update the dynamic body.
   * @param  {Number} delta The delta time value.
   */
  update(delta) {
    // Get bodies from surrounding sectors
    const bodies = this.world.getAdjacentBodies(this);

    // Unmark id from sector before moving
    this.world.getSector(this.gridX, this.gridY).remove(this);

    // Update angle
    this.angle = (this.angle + Math.round(this.rotVelocity * delta) + DEG_360) % DEG_360;

    // Update x coordinate
    this.x += COS[this.angle] * this.velocity * delta;

    // Check for x axis collisions
    bodies.forEach((body) => {
      if (body.blocking && this.bodyCollision(body)) {
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
      if (body.blocking && this.bodyCollision(body)) {
        if (body.y > this.y) {
          this.y = (body.y - (body.length / 2)) - (this.length / 2);
        } else {
          this.y = body.y + (body.length / 2) + (this.length / 2);
        }
      }
    });

    // Mark current sector with id
    this.world.getSector(this.gridX, this.gridY).add(this);
  }
}

export default DynamicBody;
