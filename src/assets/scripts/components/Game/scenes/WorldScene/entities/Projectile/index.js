import { CELL_SIZE } from 'game/constants/config';
import DynamicEntity from '../DynamicEntity';

const STATES = {
  IDLE: 'projectile:idle',
  TRAVELLING: 'projectile:travelling',
  EXPLODING: 'projectile:exploding',
};

class Projectile extends DynamicEntity {
  constructor({
    width = CELL_SIZE / 4,
    length = CELL_SIZE / 4,
    height = CELL_SIZE / 4,
    ...other
  }) {
    super({
      width,
      length,
      height,
      ...other,
    });
  }

  setIdle() {
    return this.setState(STATES.IDLE);
  }

  setTravelling() {
    return this.setState(STATES.TRAVELLING);
  }

  setExploding() {
    return this.setState(STATES.EXPLODING);
  }
}

export default Projectile;
