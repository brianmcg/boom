import { Body } from '~/core/physics';

export default class GameObject extends Body {
  constructor({ type, ...other }) {
    super(other);
    this.type = type;
  }
}
