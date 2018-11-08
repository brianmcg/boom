import * as PIXI from 'pixi.js';

class DataLoader extends PIXI.loaders.Loader {
  load(assets) {
    return new Promise((resolve) => {
      assets.forEach(asset => this.add(...asset));
      super.load((loader, resources) => {
        resolve(resources);
      });
    });
  }
}

export default DataLoader;
