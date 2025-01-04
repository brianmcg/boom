import { Container } from '@game/core/graphics';
import SceneGraphics from '../utils/SceneGraphics';

export default class MainContainer extends Container {
  constructor() {
    super();

    this.pixelateFilter = SceneGraphics.createPixelateFilter();
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
    this.filters = [this.pixelateFilter];
  }

  stop() {
    super.stop();
    this.filters = [this.pixelateFilter];
  }

  play() {
    super.play();
    this.filters = [];
  }

  destroy(options) {
    super.destroy(options);
    this.pixelateFilter = null;
  }
}
