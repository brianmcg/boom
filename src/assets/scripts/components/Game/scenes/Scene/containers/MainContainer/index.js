import { Container, PixelateFilter } from '~/core/graphics';

const PIXEL = {
  MAX_SIZE: 100,
  INCREMEMENT: 4,
  MIN_SIZE: 1,
  PAUSE_SIZE: 10,
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
   * Creates a MainContainer.
   */
  constructor() {
    super();

    this.pixelateFilter = new PixelateFilter();
    this.filters = [this.pixelateFilter];
    this.disablePixelFilter();
  }

  /**
   * Update the fade in effect.
   * @param  {Number} delta The delta time.
   */
  updateFadingIn(delta) {
    let pixelSize = this.pixelateFilter.size[0] - (PIXEL.INCREMEMENT * this.parent.scale.x * delta);

    if (pixelSize < PIXEL.MIN_SIZE) {
      pixelSize = PIXEL.MIN_SIZE;
      this.emit(EVENTS.FADE_IN_COMPLETE);
    }

    this.pixelateFilter.size = pixelSize;
  }

  /**
   * Update the fade out effect.
   * @param  {Number} delta The delta time.
   */
  updateFadingOut(delta) {
    const maxPixelSize = PIXEL.MAX_SIZE * this.parent.scale.x;
    let pixelSize = this.pixelateFilter.size[0] + (PIXEL.INCREMEMENT * this.parent.scale.x * delta);

    if (pixelSize > maxPixelSize) {
      pixelSize = maxPixelSize;
      this.emit(EVENTS.FADE_OUT_COMPLETE);
    }

    this.pixelateFilter.size = pixelSize;
  }

  /**
   * Update the paused effect.
   */
  updatePaused() {
    this.pixelateFilter.size = PIXEL.PAUSE_SIZE * this.parent.scale.x;
  }

  setFadingIn() {
    this.enablePixelFilter();
  }

  setLoading() {
    this.disablePixelFilter();
  }

  setFadingOut() {
    this.enablePixelFilter();
  }

  /**
   * Pause the MainContainer.
   */
  setPaused() {
    this.enablePixelFilter();
    super.stop();
  }

  /**
   * Resume the MainContainer.
   */
  setRunning() {
    this.disablePixelFilter();
    super.play();
  }

  /**
   * Enable the pixel filter.
   */
  enablePixelFilter() {
    this.pixelateFilter.enabled = true;
  }

  /**
   * Disable the pixel filter.
   */
  disablePixelFilter() {
    this.pixelateFilter.enabled = false;
  }

  /**
   * The container events.
   */
  static get EVENTS() {
    return EVENTS;
  }
}

export default MainContainer;
