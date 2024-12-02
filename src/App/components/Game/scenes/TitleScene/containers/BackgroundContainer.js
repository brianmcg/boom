import { Container } from '@game/core/graphics';

// const PIXEL_SIZE = 2;

export default class BackgroundContainer extends Container {
  constructor({ sparks, background }) {
    super();

    this.addChild(background);
    this.addChild(sparks);

    // this.pixelateFilter = new PixelateFilter();

    // this.filters = [this.pixelateFilter];

    // this.pixelateFilter.enabled = true;
  }

  // update(ticker) {
  //   super.update(ticker);

  //   const { parent } = this.parent;

  //   this.pixelateFilter.size = PIXEL_SIZE * parent.getStageScale();
  // }
}
