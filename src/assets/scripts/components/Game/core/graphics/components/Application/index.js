import { Application as PixiApplication } from 'pixi.js';
import EventEmitter from '../EventEmitter';

/**
 * Class representing an application.
 */
class Application extends PixiApplication {
  /**
   * Creates and application
   * @param  {Object} options The application options.
   */
  constructor(...options) {
    super(...options);

    delete this.loader;
    delete this.resize;

    this.eventEmitter = new EventEmitter();

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
    this.eventEmitter.on(event, callback);
  }

  /**
   * Trigger an event.
   * @param  {Event}    event    The event to listen for.
   * @param  {Function} callback The callback to execute.
   */
  emit(event, callback) {
    this.eventEmitter.emit(event, callback);
  }

  get style() {
    return this.renderer.view.style;
  }

  set style(style) {
    Object.assign(this.renderer.view.style, style);
  }
}

export default Application;
