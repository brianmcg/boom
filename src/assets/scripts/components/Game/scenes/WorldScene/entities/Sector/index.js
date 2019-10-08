import { Sector as PhysicsSector } from '~/core/physics';

class Sector extends PhysicsSector {
  constructor({ sides = {}, ...other }) {
    super(other);

    this.front = sides.front;
    this.left = sides.left;
    this.back = sides.back;
    this.right = sides.right;
    this.bottom = sides.bottom;
    this.top = sides.top;
  }
}

export default Sector;
