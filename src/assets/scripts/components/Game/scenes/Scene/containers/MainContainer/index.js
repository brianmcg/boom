import { Container, PixelateFilter, ColorMatrixFilter } from 'game/core/graphics';

class MainContainer extends Container {
  constructor() {
    super();

    this.filters = [
      new PixelateFilter(),
      new ColorMatrixFilter(),
    ];
  }

  enablePixelFilter() {
    this.filters[0].enabled = true;
  }

  disablePixelFilter() {
    this.filters[0].enabled = false;
  }

  setPixelSize(size) {
    this.filters[0].size = size;
  }

  enableColorFilter() {
    this.filters[1].enabled = true;
  }

  disableColorFilter() {
    this.filters[1].enabled = false;
  }

  desaturate() {
    this.filters[1].desaturate();
  }
}

export default MainContainer;
