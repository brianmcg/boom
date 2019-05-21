import { Sector as PhysicsSector } from '~/core/physics';

class Sector extends PhysicsSector {
  constructor({ sideIds, ...other }) {
    super(other);
    this.sideIds = sideIds;
  }
}

export default Sector;
