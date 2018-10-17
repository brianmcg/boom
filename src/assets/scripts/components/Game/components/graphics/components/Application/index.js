import * as PIXI from 'pixi.js';
import { BLACK, SCREEN } from '../../constants';
import { getMaxScaleFactor } from '../../util';
/**
 * Class representing an application.
 */
class Application extends PIXI.Application {
  /**
   * Create an application.
   */
  constructor() {
    super(SCREEN.WIDTH, SCREEN.HEIGHT, {
      backgroundColor: BLACK,
      autoStart: false,
    });

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
    const scaleFactor = getMaxScaleFactor(SCREEN.WIDTH, SCREEN.HEIGHT);
    const scaledWidth = SCREEN.WIDTH * scaleFactor;
    const scaledHeight = SCREEN.HEIGHT * scaleFactor;

    this.renderer.view.style.margin = `-${scaledHeight / 2}px 0 0 -${scaledWidth / 2}px`;
    this.renderer.resize(scaledWidth, scaledHeight);

    if (this.scene) {
      this.scene.resize({ x: scaleFactor, y: scaleFactor });
    }
  }
}

export default Application;
