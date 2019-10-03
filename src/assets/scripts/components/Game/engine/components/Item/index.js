import { Body } from '~/core/physics';

class Item extends Body {
  constructor({
    key,
    value,
    type,
    ...other
  }) {
    super(other);
    this.key = key;
    this.value = value;
    this.distanceToPlayer = 0;
    this.type = type;
  }

  update() {
    const { player } = this.world;
    this.distanceToPlayer = player.distanceTo(this);
  }
}

export default Item;
