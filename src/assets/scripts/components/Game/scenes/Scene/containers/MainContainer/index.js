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
  updateFadeEffect(value = 0, { pixelSize = 1 } = {}) {
    super.updateFadeEffect(value);

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
  stop() {
    this.pixelateFilter.enabled = true;
    super.stop();
  }

  /**
   * Resume the container.
   */
  play() {
    this.pixelateFilter.enabled = false;
    super.play();
  }
}

export default MainContainer;
