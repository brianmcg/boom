import * as PIXI from 'pixi.js';

class Application extends PIXI.Application {
  constructor(...props) {
    super(...props);
    this.ticker.add(this.loop.bind(this));
  }
}

export default Application;
