import { TIME_STEP } from 'game/constants/config';

const TIME_TO_LIVE = 3000;

class Explosion {
  constructor({
    id,
    type,
    x,
    y,
    world,
  }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.timer = 0;
    this.world = world;
    this.type = type;
  }

  update(delta) {
    this.timer += TIME_STEP * delta;

    if (this.timer >= TIME_TO_LIVE) {
      this.timer = 0;
      this.world.removeExplosion(this);
    }
  }
}

export default Explosion;
