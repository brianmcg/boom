import * as PIXI from 'pixi.js';

const { TextureCache } = PIXI.utils;

const pixiLoader = new PIXI.loaders.Loader();

class DataLoader {
  static load(assets) {
    return new Promise((resolve) => {
      assets.forEach(asset => pixiLoader.add(...asset));
      pixiLoader.load((loader, resources) => resolve(resources));
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
