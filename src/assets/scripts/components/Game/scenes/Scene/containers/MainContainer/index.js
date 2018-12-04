import { Container, PixelateFilter, ColorMatrixFilter } from '~/core/graphics';

const PIXEL = {
  MAX_SIZE: 100,
  INCREMEMENT: 2,
  MIN_SIZE: 1,
  PAUSE_SIZE: 4,
};

const EVENTS = {
  FADE_IN_COMPLETE: 'fade:in:complete',
  FADE_OUT_COMPLETE: 'fade:out:complete',
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

  updateRunning(delta, elapsedMS) {
    this.updateable.forEach(u => u.update(delta, elapsedMS));
  }

  /**
   * Update the fade in effect.
   * @param  {Number} delta The delta time.
   */
  updateFadeIn(delta) {
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
  updateFadeOut(delta) {
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
   * @return {[type]} [description]
   */
  desaturate() {
    this.filters[1].desaturate();
  }
}

export default MainContainer;
