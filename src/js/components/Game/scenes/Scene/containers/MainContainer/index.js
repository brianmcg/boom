import { Container, PixelateFilter } from 'game/core/graphics';

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
    this.pixelateFilter.enabled = true;
  }

  /**
   * Update the pause effect.
   * @param  {Number} value The value of the effect.
   */
  fade(value = 0, { pixelSize = 1 } = {}) {
    super.fade(value);

    let size = value * pixelSize;

    if (this.parent) {
      size *= this.parent.getScale();
    }

    if (size < 1) {
      size = 1;
    }

    this.pixelateFilter.size = size;
  }

  /**
   * Pause the container.
   */
  pause() {
    super.pause();
    this.pixelateFilter.enabled = true;
  }

  /**
   * Stop the container.
   */
  stop() {
    super.stop();
    this.pixelateFilter.enabled = true;
  }

  /**
   * Play the container.
   */
  play() {
    super.play();
    this.pixelateFilter.enabled = false;
  }
}

export default MainContainer;
