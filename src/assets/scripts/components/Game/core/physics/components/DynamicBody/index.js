import Body from '../Body';
import { COS, SIN, DEG } from '../../constants';

export const collision = (bodyA, bodyB) => (
  bodyA.x < bodyB.x + bodyB.width
    && bodyA.x + bodyA.width > bodyB.x
    && bodyA.y < bodyB.y + bodyB.length
    && bodyA.length + bodyA.y > bodyB.y
);

/**
 * Class representing a dynamic body.
 */
export default class DynamicBody extends Body {
  constructor(options = {}) {
    super(options);

    const { maxVelocity = 0, maxRotationVelocity = 0 } = options;

    this.velocity = 0;
    this.rotationVelocity = 0;
    this.maxVelocity = maxVelocity;
    this.maxRotationVelocity = maxRotationVelocity;
  }

  update(delta = 1, world) {
    world.sector(this.gridX, this.gridY).removeChildId(this.id);

    this.angle += Math.round(this.rotationVelocity * delta);

    while (this.angle < 0) {
      this.angle += DEG[360];
    }

    this.angle %= DEG[360];

    this.x = this.x + COS[this.angle] * this.velocity * delta;
    this.y = this.y + SIN[this.angle] * this.velocity * delta;

    // TODO: add collision logic

    // Get adjacent sectors.
    const { gridX, gridY } = this;

    for (let x = gridX - 1; x <= gridX + 1; x += 1) {
      for (let y = gridY - 1; y <= gridY + 1; y += 1) {
        const sector = world.sector(x, y);

        if (sector.isBlocking() && collision(this.shape, sector.shape)) {
          console.log('collide');
        }
      }
    }

    // console.log(sectors);

    // this.x = newX;
    // this.y = newY;

    world.sector(this.gridX, this.gridY).addChildId(this.id);
  }
}
