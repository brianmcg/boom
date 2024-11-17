import { Assets } from 'pixi.js';

/**
 * Class representing a graphics loader.
 */
export default class GraphicsLoader {
  /**
   * Load graphics resources.
   * @param  {String} options.src   The source of the asset.
   * @return {Promise}              Resolves when assets load.
   */
  static load(src) {
    return Assets.load(src);
  }

  /**
   * Unload the graphics.
   * @param  {Array}  src The keys of the cache items to clear.
   */
  static unload(src = GraphicsLoader.cacheKeys) {
    const keys = Array.isArray(src) ? src : [src];

    return Promise.all(
      keys.reduce(
        (memo, key) =>
          Assets.cache.has(key) ? [...memo, Assets.unload(key)] : memo,
        []
      )
    );
  }

  static get cacheKeys() {
    return [...Assets.cache._cache.keys()];
  }
}
