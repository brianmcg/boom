import Sector from '../Sector';

class FlatSector extends Sector {
  constructor({ axis, ...other }) {
    super(other);
    this.axis = axis;
  }
}

export default FlatSector;
