import { Body } from '~/core/physics';

export default class Item extends Body {
  constructor({ key, value, ...other }) {
    super(other);
    this.key = key;
    this.value = value;
    this.distanceToPlayer = 0;
  }

  update() {
    this.distanceToPlayer = this.world.player.distanceTo(this);
  }
}
