import { Body } from '~/core/physics';

class Item extends Body {
  constructor({ key, value, ...other }) {
    super(other);
    this.key = key;
    this.value = value;
    this.distanceToPlayer = 0;
  }

  update() {
    const { player } = this.world;
    this.distanceToPlayer = player.distanceTo(this);
  }
}

export default Item;
