import Actor from '../Actor';
import { DEG } from '~/core/physics';

class Enemy extends Actor {
  constructor(options) {
    super(options);
    this.velocity = 1;
    this.rotVelocity = DEG[1];
    this.distanceToPlayer = 0;
  }

  update(delta) {
    super.update(delta);
    this.distanceToPlayer = this.world.player.distanceTo(this);
  }
}

export default Enemy;
