import { Container } from '@game/core/graphics';

export default class BackgroundContainer extends Container {
  constructor(sprites) {
    super();

    this.addChild(sprites.background);
    this.addChild(sprites.sparks);
    this.sprites = sprites;
  }

  destroy(options) {
    super.destroy(options);
    this.sprites = null;
  }
}
