import * as PIXI from 'pixi.js';

class Scene extends PIXI.Container {
  constructor(props = {}) {
    super();
    this.props = props;
  }

  load() {
    const { assets, loader } = this.props;

    return new Promise((resolve) => {
      assets.forEach(asset => loader.add(...asset));
      loader.load(this.onLoad.bind(this, resolve));
    });
  }

  onLoad(resolve, loader, resources) {
    this.create(resources);
    resolve(this);
  }

  resize(scale = 1) {
    this.scale = { x: scale, y: scale };
  }
}

export default Scene;
