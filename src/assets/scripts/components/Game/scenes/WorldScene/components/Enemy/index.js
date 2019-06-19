import Actor from '../Actor';
import { DEG } from '~/core/physics';

export default class Enemy extends Actor {
  constructor(options) {
    super(options);
    this.velocity = 1;
    this.rotVelocity = DEG[1];
    this.distanceToPlayer = 0;

    // if (this.constructor === Enemy) {
    //   throw new TypeError('Can not construct abstract class.');
    // }
  }

  update(delta) {
    super.update(delta);
    this.distanceToPlayer = this.world.player.distanceTo(this);
  }
}
