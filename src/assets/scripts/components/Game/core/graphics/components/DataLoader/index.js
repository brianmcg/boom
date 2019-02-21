import * as PIXI from 'pixi.js';

const { TextureCache } = PIXI.utils;

const { Loader } = PIXI.loaders;

const loader = new Loader();

class DataLoader {
  static load(assets) {
    return new Promise((resolve) => {
      assets.forEach(asset => loader.add(...asset));
      loader.load((instance, resources) => resolve(resources));
    });
  }

  /**
   * Clear the texture cache
   * @param  {String} options.exclude Key name to exclude from operation.
   */
  static reset({ exclude }) {
    loader.reset();

    Object.keys(TextureCache).forEach((key) => {
      if (TextureCache[key] && !key.includes(exclude)) {
        TextureCache[key].destroy(true);
      }
    });
  }
}

export default DataLoader;
