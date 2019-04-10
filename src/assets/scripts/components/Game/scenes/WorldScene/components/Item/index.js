import { Body } from '~/core/physics';

export default class Item extends Body {
  constructor({ face, ...other }) {
    super(other);
    this.face = face;
  }
}
