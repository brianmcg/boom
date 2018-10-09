import * as PIXI from 'pixi.js';
import { SCREEN } from 'game/config';
import { BLACK } from '../../constants';
import util from '../../util';
/**
 * Class representing an application.
 */
class Application extends PIXI.Application {
  /**
   * Create an application.
   */
  constructor(...props) {
    super(...props, {
      backgroundColor: BLACK,
      autoStart: false,
    });

    this.renderer.view.style.position = 'absolute';
    this.renderer.view.style.left = '50%';
    this.renderer.view.style.top = '50%';

    this.ticker.add(this.executeLoop.bind(this));
  }

  /**
   * Resize the application
   */
  resize() {
    const scale = util.getScale(SCREEN);

    this.renderer.view.style.margin = `-${scale.height / 2}px 0 0 -${scale.width / 2}px`;
    this.renderer.resize(scale.width, scale.height);

    if (this.scene) {
      this.scene.resize({ x: scale.factor, y: scale.factor });
    }
  }
}

export default Application;
