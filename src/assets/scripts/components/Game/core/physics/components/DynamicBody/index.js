import Body from '../Body';
import { COS, SIN, DEG } from '../../constants';

/**
 * Class representing a dynamic body.
 */
export default class DynamicBody extends Body {
  constructor(options = {}) {
    super(options);
    this.velocity = 0;
    this.rotVelocity = 0;
  }

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
