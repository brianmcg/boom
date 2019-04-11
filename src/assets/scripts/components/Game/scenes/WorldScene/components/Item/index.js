import { Body } from '~/core/physics';

export default class Item extends Body {
  constructor({ type, ...other }) {
    super(other);
    this.type = type;
  }
}
