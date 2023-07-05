import { TextureCache, Loader } from '../../pixi';

const Assets = new Loader();

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
    Assets.add(src, src);

    return new Promise(resolve => {
      Assets.load((_, resources) => resolve(resources[src]));
    });
  }

  /**
   * Unload the graphics.
   * @param  {Array}  keys The keys of the cache items to clear.
   */
  static unload(src) {
    Assets.reset();

    // This is a temporary way of unloading until upgrading using PIXI.Assets.
    const keys = src
      ? GraphicsLoader.cacheKeys.filter(key => key !== 'assets/doom_regular.png')
      : GraphicsLoader.cacheKeys;

    keys.forEach(key => {
      const imageKey = GraphicsLoader.cacheKeys.includes(key) ? key : `${key}_image`;

      if (TextureCache[imageKey]) {
        TextureCache[imageKey].destroy(true);
        delete TextureCache[imageKey];
      }
    });

    return new Promise(resolve => {
      resolve();
    });
  }

  static get cacheKeys() {
    return Object.keys(TextureCache);
  }
}

export default GraphicsLoader;
