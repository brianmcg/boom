import { Body } from '~/core/physics';

export default class Item extends Body {
  constructor({ key, value, ...other }) {
    super(other);
    this.key = key;
    this.value = value;
  }
}
