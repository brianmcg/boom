import * as PIXI from 'pixi.js';
import { BLACK } from '../constants';

class Application extends PIXI.Application {
  constructor(...props) {
    super(...props, {
      backgroundColor: BLACK,
      autoStart: false,
    });
    this.ticker.add(this.loop.bind(this));
  }
}

export default Application;
