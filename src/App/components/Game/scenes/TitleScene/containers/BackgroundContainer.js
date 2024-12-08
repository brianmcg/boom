import { Container } from '@game/core/graphics';

// const PIXEL_SIZE = 2;

export default class BackgroundContainer extends Container {
  constructor(sprites) {
    super();

    this.addChild(sprites.background);
    this.addChild(sprites.sparks);
    this.sprites = sprites;

    // this.pixelateFilter = new PixelateFilter();
    // this.filters = [this.pixelateFilter];
    // this.pixelateFilter.enabled = true;
  }

  // update(ticker) {
  //   super.update(ticker);
  //   const { parent } = this.parent;
  //   this.pixelateFilter.size = PIXEL_SIZE * parent.getStageScale();
  // }

  destroy(options) {
    Object.values(this.sprites).forEach(sprite => sprite.destroy(options));
    super.destroy(options);
  }
}
