import translate from 'root/translate';
import Item from '../Item';

class Weapon extends Item {
  constructor({ type, ...other }) {
    super(other);
    this.type = type;
    this.translation = translate(`world.item.${type}`);
  }
}

export default Weapon;
