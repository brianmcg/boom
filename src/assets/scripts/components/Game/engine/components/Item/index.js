import { Body } from '~/core/physics';

class Item extends Body {
  constructor({
    key,
    value,
    type,
    ...other
  }) {
    super(other);
    this.key = key;
    this.value = value;
    this.type = type;
  }
}

export default Item;
