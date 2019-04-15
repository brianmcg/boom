import { Body } from '~/core/physics';

export default class GameObject extends Body {
  constructor({ type, ...other }) {
    super(other);
    this.type = type;
    this.distanceToPlayer = 0;
  }

  update() {
    this.distanceToPlayer = this.world.player.distanceTo(this);
  }
}
