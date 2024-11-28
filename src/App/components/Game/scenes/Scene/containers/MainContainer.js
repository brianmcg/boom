import { Container, PixelateFilter } from '@game/core/graphics';

export default class MainContainer extends Container {
  constructor() {
    super();

    this.pixelateFilter = new PixelateFilter();
    this.filters = [this.pixelateFilter];
    this.pixelateFilter.enabled = true;
  }

  fade(value = 0, { pixelSize = 1 } = {}) {
    super.fade(value);

    let size = value * pixelSize;

    if (this.parent) {
      size *= this.parent.getStageScale();
    }

    if (size < 1) {
      size = 1;
    }

    this.pixelateFilter.size = size;
  }

  pause() {
    super.pause();
    this.pixelateFilter.enabled = true;
  }

  stop() {
    super.stop();
    this.pixelateFilter.enabled = true;
  }

  play() {
    super.play();
    this.pixelateFilter.enabled = false;
  }
}
