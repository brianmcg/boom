import { Container } from '@game/core/graphics';

export default class BackgroundContainer extends Container {
  constructor(sprite) {
    super();
    this.addChild(sprite);
    this.sprite = sprite;
  }

  destroy(options) {
    super.destroy(options);
    this.sprite = null;
  }
}
