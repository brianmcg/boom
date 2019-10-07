import AbstractActor from '../AbstractActor';
import { DEG } from '~/core/physics';

class AbstractEnemy extends AbstractActor {
  constructor({ type, ...options }) {
    super(options);
    this.velocity = 1;
    this.rotVelocity = DEG[1];
    this.type = type;

    if (this.constructor === AbstractEnemy) {
      throw new TypeError('Can not construct abstract class.');
    }
  }

  update(delta) {
    super.update(delta);
  }
}

export default AbstractEnemy;
