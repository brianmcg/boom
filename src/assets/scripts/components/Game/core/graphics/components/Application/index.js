import { Application as PixiApplication } from 'pixi.js';

/**
 * Class representing an application.
 */
export default class Application extends PixiApplication {
  /**
   * Creates and application
   * @param  {Object} options The application options.
   */
  constructor(...options) {
    super(...options);

    this.renderer.view.style.position = 'absolute';
    this.renderer.view.style.left = '50%';
    this.renderer.view.style.top = '50%';
    this.resize = Application.prototype.resize;
    this.loader = null;
    window.addEventListener('resize', this.onResize.bind(this));
  }

  /**
   * Add event listener to application.
   * @param  {Event}    event    The event to listen for.
   * @param  {Function} callback The callback to execute.
   */
  on(event, callback) {
    this.stage.on(event, callback);
  }

  /**
   * Trigger an event.
   * @param  {Event}    event    The event to listen for.
   * @param  {Function} callback The callback to execute.
   */
  emit(event, callback) {
    this.stage.emit(event, callback);
  }

  /**
   * Resize the Applicaiton
   * @param  {Number} width  The given width.
   * @param  {Number} height The given height.
   */
  resize(width = 320, height = 180) {
    const scaleFactor = Application.getMaxScaleFactor(width, height);
    const scaledWidth = width * scaleFactor;
    const scaledHeight = height * scaleFactor;

    this.renderer.view.style.margin = `-${scaledHeight / 2}px 0 0 -${scaledWidth / 2}px`;
    this.renderer.resize(scaledWidth, scaledHeight);

    if (this.scene) {
      this.scene.resize({ x: scaleFactor, y: scaleFactor });
    }
  }

  /**
   * Get the max scale of the canvas that fits window.
   * @param  {Number} width  The given width.
   * @param  {Number} height The given height.
   * @return {Number} The maximum scale factor.
   */
  static getMaxScaleFactor(width = 320, height = 180) {
    const windowWidth = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;

    const windowHeight = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight;

    const widthRatio = windowWidth / width;
    const heightRatio = windowHeight / height;

    return Math.floor(Math.min(widthRatio, heightRatio)) || 1;
  }
}