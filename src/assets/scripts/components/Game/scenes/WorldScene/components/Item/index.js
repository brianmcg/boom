import { Body } from '~/core/physics';

export default class Item extends Body {
  constructor({ textureId, ...other }) {
    super(other);
    this.textureId = textureId;
  }
}
