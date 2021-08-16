import { Application as PixiApplication } from 'pixi.js';

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
    super({ ...options, autoStart: false, clearBeforeRender: false });

    delete this.loader;
    delete this.resize;
    delete this.start;
    delete this.stop;

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

  get style() {
    return this.renderer.view.style;
  }

  set style(style) {
    Object.assign(this.renderer.view.style, style);
  }
}

export default Application;
