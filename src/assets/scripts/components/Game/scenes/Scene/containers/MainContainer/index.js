import { Container, PixelateFilter } from 'game/core/graphics';

const PIXEL = {
  MAX_SIZE: 100,
  INCREMEMENT: 4,
  MIN_SIZE: 1,
  PAUSE_SIZE: 10,
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
  }

  /**
   * Initialize the fade in effect.
   */
  initFadeInEffect() {
    this.enablePixelFilter();
    this.setPixelSize(PIXEL.MAX_SIZE);
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
    let pixelSize = this.pixelateFilter.size[0] - (PIXEL.INCREMEMENT * this.parent.scale.x * delta);

    if (pixelSize < PIXEL.MIN_SIZE) {
      pixelSize = PIXEL.MIN_SIZE;
      this.parent.setRunning();
    }

    this.pixelateFilter.size = pixelSize;
  }

  /**
   * Update the fade out effect.
   * @param  {Number} delta The delta time.
   */
  updateFadeOutEffect(delta) {
    const maxPixelSize = PIXEL.MAX_SIZE * this.parent.scale.x;
    let pixelSize = this.pixelateFilter.size[0] + (PIXEL.INCREMEMENT * this.parent.scale.x * delta);

    if (pixelSize > maxPixelSize) {
      pixelSize = maxPixelSize;
      this.parent.setStopped();
    }

    this.pixelateFilter.size = pixelSize;
  }

  /**
   * Update the paused effect.
   */
  updatePauseEffect() {
    this.setPixelSize(PIXEL.PAUSE_SIZE);
  }

  /**
   * Set the pixel size.
   * @param {Number} value The value to set.
   */
  setPixelSize(value) {
    this.pixelateFilter.size = value * this.parent.scale.x;
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
