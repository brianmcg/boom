import { Body } from '~/core/physics';

class Entity extends Body {
  constructor({ type, ...other }) {
    super(other);
    this.type = type;
    this.distanceToPlayer = 0;
  }

  update() {
    const { player } = this.world;
    this.distanceToPlayer = player.distanceTo(this);
  }
}

export default Entity;
