import { utils, Loader } from 'pixi.js';

const { TextureCache } = utils;

/**
 * Class representing a data loader.
 */
export default class DataLoader {
  /**
   * Creates a data loader.
   */
  constructor() {
    this.loader = new Loader();
    this.cache = TextureCache;
  }

  /**
   * Load data resources.
   * @param  {Object} assets The assets to load.
   * @return {Promise}       Resolves when assets load.
   */
  load(assets) {
    assets.forEach(asset => this.loader.add(asset.name, asset.src));
    return new Promise(resolve => this.loader.load((loader, resources) => resolve(resources)));
  }

  /**
   * Unload the data.
   * @param  {Array}  keys The keys of the cache items to clear.
   */
  unload(keys = []) {
    this.loader.reset();

    Object.keys(this.cache).forEach((key) => {
      if (this.cache[key] && (!keys.length || keys.includes(key))) {
        this.cache[key].destroy(true);
        delete this.cache[key];
      }
    });
  }
}
