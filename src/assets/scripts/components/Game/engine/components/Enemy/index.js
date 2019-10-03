import Actor from '../Actor';
import { DEG } from '~/core/physics';

class Enemy extends Actor {
  constructor(options) {
    super(options);
    this.velocity = 1;
    this.rotVelocity = DEG[1];

    // if (this.constructor === Enemy) {
    //   throw new TypeError('Can not construct abstract class.');
    // }
  }

  update(delta) {
    super.update(delta);
  }
}

export default Enemy;
