import Body from '../Body';
import { COS, SIN, DEG } from '../../constants';

/**
 * Class representing a dynamic body.
 */
export default class DynamicBody extends Body {
  constructor(options = {}) {
    const { maxVelocity = 0, maxRotationVelocity = 0 } = options;

    super(options);

    this.velocity = 0;
    this.rotationVelocity = 0;
    this.maxVelocity = maxVelocity;
    this.maxRotationVelocity = maxRotationVelocity;
  }

  update(delta = 1, world) {
    const bodies = world.adjacentBodies(this);

    world.sector(this.gridX, this.gridY).removeChildId(this.id);

    this.angle += Math.round(this.rotationVelocity * delta);

    this.angle %= DEG[360];

    if (this.angle < 0) {
      this.angle += DEG[360];
    }

    this.x += COS[this.angle] * this.velocity * delta;

    bodies.forEach((body) => {
      if (body.blocking(this) && body.collide(this)) {
        if (body.x > this.x) {
          this.x = (body.x - (body.width / 2)) - (this.width / 2);
        } else {
          this.x = body.x + (body.width / 2) + (this.width / 2);
        }
      }
    });

    this.y += SIN[this.angle] * this.velocity * delta;

    bodies.forEach((body) => {
      if (body.blocking(this) && body.collide(this)) {
        if (body.y > this.y) {
          this.y = (body.y - (body.length / 2)) - (this.length / 2);
        } else {
          this.y = body.y + (body.length / 2) + (this.length / 2);
        }
      }
    });

    world.sector(this.gridX, this.gridY).addChildId(this.id);
  }
}
