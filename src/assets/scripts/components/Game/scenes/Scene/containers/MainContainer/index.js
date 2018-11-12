import { Container, PixelateFilter, ColorMatrixFilter } from '~/core/graphics';

const PIXEL = {
  MAX_SIZE: 100,
  INCREMEMENT: 2,
  MIN_SIZE: 1,
  PAUSE_SIZE: 4,
};

const EVENTS = {
  FADE_IN_COMPLETE: 'FADE_IN_COMPLETE',
  FADE_OUT_COMPLETE: 'FADE_OUT_COMPLETE',
};

class MainContainer extends Container {
  constructor() {
    super();

    this.filters = [
      new PixelateFilter(),
      new ColorMatrixFilter(),
    ];

    this.on('added', () => {
      this.pixelSize = PIXEL.MAX_SIZE * this.parent.scale.x;
    });
  }

  enablePixelFilter() {
    this.filters[0].enabled = true;
  }

  disablePixelFilter() {
    this.filters[0].enabled = false;
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

  render() {
    this.filters[0].size = this.pixelSize;
  }

  updateFadeIn(delta) {
    this.pixelSize -= PIXEL.INCREMEMENT * this.parent.scale.x * delta;

    if (this.pixelSize < PIXEL.MIN_SIZE) {
      this.pixelSize = PIXEL.MIN_SIZE;
      this.emit(EVENTS.FADE_IN_COMPLETE);
    }
  }

  updateFadeOut(delta) {
    const maxPixelSize = PIXEL.MAX_SIZE * this.parent.scale.x;

    this.pixelSize += PIXEL.INCREMEMENT * this.parent.scale.x * delta;

    if (this.pixelSize > maxPixelSize) {
      this.pixelSize = maxPixelSize;
      this.emit(EVENTS.FADE_OUT_COMPLETE);
    }
  }

  updatePaused() {
    this.pixelSize = PIXEL.PAUSE_SIZE * this.parent.scale.x;
  }

  static get EVENTS() {
    return EVENTS;
  }
}

export default MainContainer;
