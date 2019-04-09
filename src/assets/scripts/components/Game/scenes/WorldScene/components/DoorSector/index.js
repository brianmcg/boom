import { Sector } from '~/core/physics';

export default class DoorSector extends Sector {
  constructor({ key, axis, ...other }) {
    super(other);
    this.key = key;
    this.axis = axis;
  }

  update(delta) {
    // if (this.length) {
    // console.log(this.length);
        this.width = 0;

    // }
  }

  // get shape() {
  //   if (this.axis === 'x') {
  //     return {
  //       x: this.x - 2,
  //       y: this.y - this.length / 2,
  //       width: 4,
  //       length: this.length,
  //     };
  //   }

  //   return {
  //     x: this.x - this.width / 2,
  //     y: this.y - 2,
  //     width: this.width,
  //     length: 4,
  //   };
  // }
}
