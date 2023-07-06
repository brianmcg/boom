import { Application as PixiApplication } from '../../pixi';

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
    super({ ...options, autoStart: false, clearBeforeRender: false, hello: true });

    this.stage.eventMode = 'static';

    window.addEventListener('resize', () => this.onResize());
  }

  /**
   * Resize the application.
   * @param  {Number} width  The new width.
   * @param  {Number} height The new height.
   */
  onResize(width, height) {
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
