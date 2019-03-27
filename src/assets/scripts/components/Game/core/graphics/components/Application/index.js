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

    delete this.loader;
    delete this.resize;

    window.addEventListener('resize', this.resize.bind(this));
  }

  /**
   * Resize the application.
   */
  resize(width, height) {
    this.renderer.resize(width, height);
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

  get style() {
    return this.renderer.view.style;
  }

  set style(style) {
    Object.assign(this.renderer.view.style, style);
  }
}
