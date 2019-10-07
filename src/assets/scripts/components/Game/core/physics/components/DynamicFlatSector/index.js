import FlatSector from '../FlatSector';

class DynamicFlatSector extends FlatSector {
  constructor({ speed, ...other }) {
    super(other);
    this.speed = speed;
  }
}

export default DynamicFlatSector;
