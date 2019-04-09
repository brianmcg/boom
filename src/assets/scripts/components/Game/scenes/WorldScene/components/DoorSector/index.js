import { Sector } from '~/core/physics';

export default class DoorSector extends Sector {
  constructor({ key, axis, ...other }) {
    super(other);
    this.key = key;
    this.axis = axis;
  }

  get shape() {
    if (this.axis === 'x') {
      return {
        x: this.x - 2,
        y: this.y - this.length / 2,
        width: this.width,
        length: this.length,
      };
    }

    return {
      x: this.x - this.width / 2,
      y: this.y - 2,
      width: this.width,
      length: this.length,
    };
  }
}
