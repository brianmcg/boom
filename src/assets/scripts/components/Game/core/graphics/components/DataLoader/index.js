import { utils, Loader } from 'pixi.js';

const { TextureCache } = utils;

const loader = new Loader();

class DataLoader {
  static load(assets) {
    return new Promise((resolve) => {
      assets.forEach(asset => loader.add(asset.name, asset.src));
      loader.load((instance, resources) => resolve(resources));
    });
  }

  /**
   * Clear the texture cache
   * @param  {String} options.exclude Key name to exclude from operation.
   */
  static reset({ exclude }) {
    loader.reset();

    // Object.keys(TextureCache).forEach((key) => {
    //   if (TextureCache[key] && !key.includes(exclude)) {
    //     TextureCache[key].destroy(true);
    //   }
    // });
  }
}

export default DataLoader;
