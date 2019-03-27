import { utils, Loader } from 'pixi.js';

const { TextureCache } = utils;

const loader = new Loader();

/**
 * Class representing a data loader.
 */
export default class DataLoader {
  /**
   * Load data resources.
   * @param  {Object} assets The assets to load.
   * @return {Promise}       Resolves when assets load.
   */
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
  static unload({ exclude = null } = {}) {
    loader.reset();

    Object.keys(TextureCache).forEach((key) => {
      if (TextureCache[key] && !key.includes(exclude)) {
        TextureCache[key].destroy(true);
      }
    });
  }
}
