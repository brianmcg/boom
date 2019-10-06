import { Body } from '~/core/physics';

class Entity extends Body {
  constructor({ type, ...other }) {
    super(other);
    this.type = type;
  }
}

export default Entity;
