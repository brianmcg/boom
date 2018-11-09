import * as PIXI from 'pixi.js';

const { TextureCache } = PIXI.utils;

class DataLoader extends PIXI.loaders.Loader {
  load(assets) {
    return new Promise((resolve) => {
      assets.forEach(asset => this.add(...asset));
      super.load((loader, resources) => {
        resolve(resources);
      });
    });
  }

  static clearCache() {
    Object.keys(TextureCache).forEach((key) => {
      if (TextureCache[key] && !key.includes('font')) {
        TextureCache[key].destroy(true);
      }
    });
  }
}

export default DataLoader;
