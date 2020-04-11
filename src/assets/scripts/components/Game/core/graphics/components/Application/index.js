import { Application as PixiApplication } from 'pixi.js';
import EventEmitter from '../EventEmitter';

/**
 * Class representing an application.
 * @extends {PIXI.Application}
 */
class Application extends PixiApplication {
  /**
   * Creates and application
   * @param  {Number}   width                   The width of the screen.
   * @param  {Number}   height                  The height of the screen.
   * @param  {Number}   options.backgroundColor A hex value representing the color.
   * @param  {Boolean}  options.autoStart       Should the application auto start.
   */
  constructor(...options) {
    super({
      ...options,
      autoStart: false,
      forceFXAA: true,
    });

    delete this.loader;
    delete this.resize;
    delete this.start;
    delete this.stop;

    this.eventEmitter = new EventEmitter();

    window.addEventListener('resize', () => this.resize());
  }

  /**
   * Resize the application.
   * @param  {Number} width  The new width.
   * @param  {Number} height The new height.
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
