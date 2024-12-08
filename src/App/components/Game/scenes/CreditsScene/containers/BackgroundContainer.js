import { Container } from '@game/core/graphics';

export default class BackgroundContainer extends Container {
  constructor(sprite) {
    super();
    this.addChild(sprite);
    this.sprite = sprite;
  }

  destroy(options) {
    this.sprite.destroy(options);
    super.destroy(options);
  }
}
