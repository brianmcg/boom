import { Sector } from '~/core/physics';

export default class GameSector extends Sector {
  constructor({ sideIds, ...other }) {
    super(other);
    this.sideIds = sideIds;
  }
}
