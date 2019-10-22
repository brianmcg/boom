import Entity from '../Entity';

const TYPES = {
  AMMO: 'ammo',
  HEALTH: 'health',
  KEY: 'key',
  WEAPON: 'weapon',
};

class Item extends Entity {
  constructor({
    key,
    value,
    ...other
  }) {
    super(other);

    this.key = key;
    this.value = value;
  }

  static get TYPES() {
    return TYPES;
  }
}

export default Item;
