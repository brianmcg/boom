import { Assets } from '@game/core/graphics';

/**
 * Class representing a graphics loader.
 */
class GraphicsLoader {
  /**
   * Load graphics resources.
   * @param  {String} options.name  The name of the asset.
   * @param  {String} options.src   The source of the asset.
   * @return {Promise}              Resolves when assets load.
   */
  static load(src) {
    return Assets.load(src);
  }

  /**
   * Unload the graphics.
   * @param  {Array}  keys The keys of the cache items to clear.
   */
  static unload(src = GraphicsLoader.cacheKeys) {
    const keys = Array.isArray(src) ? src : [src];

    return Promise.all(
      keys.reduce(
        (memo, key) => (Assets.cache.has(key) ? [...memo, Assets.unload(key)] : memo),
        [],
      ),
    );
  }

  static get cacheKeys() {
    return [...Assets.cache._cache.keys()]; // eslint-disable-line no-underscore-dangle
  }
}

export default GraphicsLoader;
