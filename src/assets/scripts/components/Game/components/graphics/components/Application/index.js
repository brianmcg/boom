import * as PIXI from 'pixi.js';
import { BLACK } from '../../constants';
import { getMaxScaleFactor } from '../../util';
/**
 * Class representing an application.
 */
class Application extends PIXI.Application {
  /**
   * Create an application.
   */
  constructor(screenWidth, screenHeight) {
    super(screenWidth, screenHeight, {
      backgroundColor: BLACK,
      autoStart: false,
    });

    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.renderer.view.style.position = 'absolute';
    this.renderer.view.style.left = '50%';
    this.renderer.view.style.top = '50%';

    this.ticker.add(this.executeLoop.bind(this));

    this.resize();
  }

  /**
   * Resize the application
   */
  resize() {
    const scaleFactor = getMaxScaleFactor(this.screenWidth, this.screenHeight);
    const scaledWidth = this.screenWidth * scaleFactor;
    const scaledHeight = this.screenHeight * scaleFactor;

    this.renderer.view.style.margin = `-${scaledHeight / 2}px 0 0 -${scaledWidth / 2}px`;
    this.renderer.resize(scaledWidth, scaledHeight);

    if (this.scene) {
      this.scene.resize({ x: scaleFactor, y: scaleFactor });
    }
  }
}

export default Application;
