import Entity from '../Entity';

class Item extends Entity {
  constructor({
    key,
    value,
    type,
    ...other
  }) {
    super(other);
    this.key = key;
    this.value = value;
  }
}

export default Item;
