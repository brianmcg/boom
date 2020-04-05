import { Container, PixelateFilter } from 'game/core/graphics';

const PIXEL_INCREMENT = 4;

const MIN_PIXEL_SIZE = 1;

const PAUSE_PIXEL_SIZE = 8;

const MAX_PIXEL_SIZE = 100;

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
  }

  /**
   * Initialize the fade in effect.
   */
  initFadeInEffect() {
    this.enablePixelFilter();
    this.setPixelSize(MAX_PIXEL_SIZE);
  }

  /**
   * Initialize the fade out effect.
   */
  initFadeOutEffect() {
    this.enablePixelFilter();
  }

  /**
   * Update the fade in effect.
   * @param  {Number} delta The delta time.
   */
  updateFadeInEffect(delta) {
    let pixelSize = this.getPixelSize();

    pixelSize -= PIXEL_INCREMENT * delta;

    if (pixelSize <= MIN_PIXEL_SIZE) {
      pixelSize = MIN_PIXEL_SIZE;
      this.parent.setRunning();
    }

    this.setPixelSize(pixelSize);
  }

  /**
   * Update the fade out effect.
   * @param  {Number} delta The delta time.
   */
  updateFadeOutEffect(delta) {
    let pixelSize = this.getPixelSize();

    pixelSize += PIXEL_INCREMENT * delta;

    if (pixelSize >= MAX_PIXEL_SIZE) {
      pixelSize = MAX_PIXEL_SIZE;
      this.parent.setStopped();
    }

    this.setPixelSize(pixelSize);
  }

  /**
   * Update the paused effect.
   */
  updatePauseEffect(amount = 0) {
    this.setPixelSize(PAUSE_PIXEL_SIZE * amount);
  }

  /**
   * Set the pixel size.
   * @param {Number} value The value to set.
   * @returns {Boolean}
   */
  setPixelSize(value = 1) {
    if (this.parent) {
      this.pixelateFilter.size = value * this.parent.scale.x;

      return true;
    }

    return false;
  }

  /**
   * Get the pixel size.
   * @return {[type]} [description]
   */
  getPixelSize() {
    if (this.parent) {
      return this.pixelateFilter.size[0] / this.parent.scale.x;
    }

    return null;
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
   * Pause the container.
   */
  stop() {
    this.enablePixelFilter();
    super.stop();
  }

  /**
   * Resume the container.
   */
  play() {
    this.disablePixelFilter();
    super.play();
  }
}

export default MainContainer;
