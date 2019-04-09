import Body from '../Body';
import { COS, SIN, DEG } from '../../constants';

/**
 * Class representing a dynamic body.
 * @extends {Body}
 */
export default class DynamicBody extends Body {
  /* Creates a dynamic body.
   * @param  {Number} options.x      The x coordinate of the dynamic body.
   * @param  {Number} options.y      The y coordinate of the dynamic body
   * @param  {Number} options.width  The width of the dynamic body.
   * @param  {Number} options.length The length of the dynamic body.
   * @param  {Number} options.height The height of the dynamic body.
   * @param  {Number} options.angle  The angle of the dynamic body.
   */
  constructor(options = {}) {
    const { angle = 0, ...other } = options;
    super(other);
    this.velocity = 0;
    this.rotVelocity = 0;
    this.angle = angle;
  }

  /**
   * Update the dynamic body.
   * @param  {Number} delta The delta time value.
   * @param  {World}  world The world that contains the body.
   */
  update(delta = 1, world) {
    // Get bodies from surrounding sectors
    const bodies = world.adjacentBodies(this);

    // Unmark id from sector before moving
    world.sector(this.gridX, this.gridY).removeChildId(this.id);

    // Update angle
    this.angle += Math.round(this.rotVelocity * delta);

    this.angle %= DEG[360];

    if (this.angle < 0) {
      this.angle += DEG[360];
    }

    // Update x coordinate
    this.x += COS[this.angle] * this.velocity * delta;

    // Check for x axis collisions
    bodies.forEach((body) => {
      if (body.blocking(this) && body.collide(this)) {
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
      if (body.blocking(this) && body.collide(this)) {
        if (body.y > this.y) {
          this.y = (body.y - (body.length / 2)) - (this.length / 2);
        } else {
          this.y = body.y + (body.length / 2) + (this.length / 2);
        }
      }
    });

    // Mark current sector with id
    world.sector(this.gridX, this.gridY).addChildId(this.id);
  }
}
