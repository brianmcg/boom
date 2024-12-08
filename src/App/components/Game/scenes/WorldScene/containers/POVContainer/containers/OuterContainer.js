import { Container } from '@game/core/graphics';

export default class OuterContainer extends Container {
  constructor(sprites) {
    super();
    sprites.forEach(sprite => this.addChild(sprite));
    this.sprites = sprites;
  }

  destroy(options) {
    this.sprites.forEach(sprite => sprite.destroy(options));
    super.destroy(options);
  }
}
