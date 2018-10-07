import * as PIXI from 'pixi.js';

class Scene extends PIXI.Container {
  constructor(props = {}) {
    super();
    this.isRunning = false;
    Object.assign(this, props);
  }

  load() {
    return new Promise((resolve) => {
      this.assets.forEach(asset => this.loader.add(...asset));
      this.loader.load(this.onLoad.bind(this, resolve));
    });
  }

  create() {
    this.input.enable();
  }

  onLoad(resolve, loader, resources) {
    this.create(resources);
    resolve(this);
  }

  resize(scale = 1) {
    this.scale = { x: scale, y: scale };
  }

  start() {
    this.isRunning = true;
  }

  pause() {
    this.isRunning = false;
  }
}

export default Scene;
