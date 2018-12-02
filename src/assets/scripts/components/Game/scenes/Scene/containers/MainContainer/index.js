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

    this.on('added', () => {
      this.pixelSize = PIXEL.MAX_SIZE * this.parent.scale.x;
    });
  }

  /**
   * Pause the MainContainer.
   */
  pause() {
    this.enablePixelFilter();
    this.enableColorFilter();
    this.desaturate();
    this.playable.forEach(child => child.stop());
    this.hideable.forEach(child => child.hide());
  }

  /**
   * Resume the MainContainer.
   */
  resume() {
    this.disablePixelFilter();
    this.disableColorFilter();
    this.playable.forEach(child => child.play());
    this.hideable.forEach(child => child.show());
  }

  /**
   * Update the fade in effect.
   * @param  {Number} delta The delta time.
   */
  updateFadeIn(delta) {
    this.pixelSize -= PIXEL.INCREMEMENT * this.parent.scale.x * delta;

    if (this.pixelSize < PIXEL.MIN_SIZE) {
      this.pixelSize = PIXEL.MIN_SIZE;
      this.emit(EVENTS.FADE_IN_COMPLETE);
    }
  }

  /**
   * Update the fade out effect.
   * @param  {Number} delta The delta time.
   */
  updateFadeOut(delta) {
    const maxPixelSize = PIXEL.MAX_SIZE * this.parent.scale.x;

    this.pixelSize += PIXEL.INCREMEMENT * this.parent.scale.x * delta;

    if (this.pixelSize > maxPixelSize) {
      this.pixelSize = maxPixelSize;
      this.emit(EVENTS.FADE_OUT_COMPLETE);
    }
  }

  /**
   * Update the paused effect.
   */
  updatePaused() {
    this.pixelSize = PIXEL.PAUSE_SIZE * this.parent.scale.x;
  }

  /**
   * Render the MainContainer.
   */
  render() {
    this.children.forEach(child => child.render && child.render());
    if (this.filters[0].enabled) this.filters[0].size = this.pixelSize;
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
