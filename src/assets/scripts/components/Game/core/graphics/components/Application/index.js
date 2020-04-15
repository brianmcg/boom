import {
  Ticker,
  Renderer,
  Container,
  UPDATE_PRIORITY,
} from 'pixi.js';

/**
 * Class representing an application.
 */
class Application {
  /**
   * Creates and application
   * @param  {Number}   width                   The width of the screen.
   * @param  {Number}   height                  The height of the screen.
   * @param  {Number}   options.backgroundColor A hex value representing the color.
   */
  constructor(...options) {
    this.renderer = new Renderer(...options);
    this.stage = new Container();
    this.ticker = new Ticker();
    this.ticker.add(() => this.renderer.render(this.stage), UPDATE_PRIORITY.LOW);
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
   * Destroy the application
   * @param  {Boolean} removeView   Automatically remove canvas from DOM.
   * @param  {Boolean} stageOptions Pass to destroy methods of all children.
   */
  destroy(removeView = false, stageOptions) {
    this.stage.destroy(stageOptions);
    this.stage = null;
    this.renderer.destroy(removeView);
    this.renderer = null;
  }

  /**
   * Get the renderer view.
   * @return {HTMLCanvasElement} The canvas element
   */
  get view() {
    return this.renderer.view;
  }

  /**
   * Get the canvas style.
   * @return {Object} The canvas style.
   */
  get style() {
    return this.renderer.view.style;
  }

  /**
   * Set the canvas style
   * @param  {[type]} style The style object.
   */
  set style(style) {
    Object.assign(this.renderer.view.style, style);
  }
}

export default Application;
