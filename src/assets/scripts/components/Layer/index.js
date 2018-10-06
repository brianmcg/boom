import * as PIXI from 'pixi.js';

class Layer extends PIXI.Container {
  constructor(props = {}) {
    super();
    this.props = props;
  }
}

export default Layer;
