import Item from '../Item';

class Weapon extends Item {
  constructor({ type, ...other }) {
    super(other);
    this.type = type;
  }
}

export default Weapon;
