import { Container, PixelateFilter, ColorMatrixFilter } from '~/core/graphics';

const PIXEL = {
  MAX_SIZE: 100,
  INCREMEMENT: 4,
  MIN_SIZE: 1,
  PAUSE_SIZE: 3,
};

const EVENTS = {
  FADE_IN_COMPLETE: 'main:fadein:complete',
  FADE_OUT_COMPLETE: 'main:fadeout:complete',
};

/**
 * A class representing a MainContainer.
 */
class MainContainer extends Container {
  /**
   * The container events.
   */
  static get EVENTS() { return EVENTS; }

  /**
   * Creates a MainContainer.
   */
  constructor() {
    super();

    this.filters = [
      new PixelateFilter(),
      new ColorMatrixFilter(),
    ];

    this.updateable = [];

    this.disablePixelFilter();
    this.disableColorFilter();

    this.on('added', () => {
      this.filters[0].size = PIXEL.MAX_SIZE * this.parent.scale.x;
    });
  }

  onFadingIn() {
    this.enablePixelFilter();
    this.disableColorFilter();
  }

  onLoading() {
    this.disablePixelFilter();
    this.disableColorFilter();
  }

  onFadingOut() {
    this.enablePixelFilter();
    this.disableColorFilter();
  }

  /**
   * Pause the MainContainer.
   */
  onPaused() {
    this.enablePixelFilter();
    this.enableColorFilter();
    this.desaturate();
    this.playable.forEach(child => child.stop());
  }

  /**
   * Resume the MainContainer.
   */
  onRunning() {
    this.disablePixelFilter();
    this.disableColorFilter();
    this.playable.forEach(child => child.play());
  }

  updateRunning(...options) {
    this.updateable.forEach(child => child.update(...options));
  }

  /**
   * Update the fade in effect.
   * @param  {Number} delta The delta time.
   */
  updateFadingIn(delta) {
    let pixelSize = this.filters[0].size[0] - (PIXEL.INCREMEMENT * this.parent.scale.x * delta);

    if (pixelSize < PIXEL.MIN_SIZE) {
      pixelSize = PIXEL.MIN_SIZE;
      this.emit(EVENTS.FADE_IN_COMPLETE);
    }

    this.filters[0].size = pixelSize;
  }

  /**
   * Update the fade out effect.
   * @param  {Number} delta The delta time.
   */
  updateFadingOut(delta) {
    const maxPixelSize = PIXEL.MAX_SIZE * this.parent.scale.x;
    let pixelSize = this.filters[0].size[0] + (PIXEL.INCREMEMENT * this.parent.scale.x * delta);

    if (pixelSize > maxPixelSize) {
      pixelSize = maxPixelSize;
      this.emit(EVENTS.FADE_OUT_COMPLETE);
    }

    this.filters[0].size = pixelSize;
  }

  /**
   * Update the paused effect.
   */
  updatePaused() {
    this.filters[0].size = PIXEL.PAUSE_SIZE * this.parent.scale.x;
  }

  /**
   * Enable the pixel filter.
   */
  enablePixelFilter() {
    this.filters[0].enabled = true;
  }

  /**
   * Disable the pixel filter.
   */
  disablePixelFilter() {
    this.filters[0].enabled = false;
  }

  /**
   * Enable the color filter.
   */
  enableColorFilter() {
    this.filters[1].enabled = true;
  }

  /**
   * Disable the color filter.
   */
  disableColorFilter() {
    this.filters[1].enabled = false;
  }

  /**
   * Desaturate the MainContainer.
   */
  desaturate() {
    this.filters[1].desaturate();
  }

  addChild(child) {
    super.addChild(child);

    if (child.update) {
      this.updateable.push(child);
    }
  }

  removeChild(child) {
    super.removeChild(child);

    if (child.update) {
      this.updateable = this.updateable.filter(u => u !== child);
    }
  }
}

export default MainContainer;
