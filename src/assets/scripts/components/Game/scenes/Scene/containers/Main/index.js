import { Container, PixelateFilter, ColorMatrixFilter } from 'game/core/graphics';

class Main extends Container {
  constructor() {
    super();

    this.filters = [
      new PixelateFilter(),
      new ColorMatrixFilter(),
    ];
  }

  disablePixelFilter() {
    this.filters[0].enabled = false;
  }

  disableColorFilter() {
    this.filters[1].enabled = false;
  }

  enablePixelFilter() {
    this.filters[0].enabled = true;
  }

  enableColorFilter() {
    this.filters[1].enabled = true;
  }

  desaturate() {
    this.filters[1].desaturate();
  }

  setPixelSize(size) {
    this.filters[0].size = size;
  }
}

export default Main;
