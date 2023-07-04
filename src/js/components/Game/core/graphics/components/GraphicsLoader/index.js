import { TextureCache, Loader } from '../../pixi';

/**
 * Class representing a graphics loader.
 */
class GraphicsLoader {
  /**
   * Creates a graphics loader.
   */
  constructor() {
    this.loader = new Loader();
    this.cache = TextureCache;
  }

  /**
   * Load graphics resources.
   * @param  {String} options.name  The name of the asset.
   * @param  {String} options.src   The source of the asset.
   * @return {Promise}              Resolves when assets load.
   */
  load({ name, src }) {
    this.loader.add(name, src);

    return new Promise(resolve => this.loader.load((_, resources) => resolve(resources[name])));
  }

  /**
   * Unload the graphics.
   * @param  {Array}  keys The keys of the cache items to clear.
   */
  unload(keys = []) {
    this.loader.reset();

    Object.keys(this.cache).forEach(key => {
      if (this.cache[key] && (!keys.length || keys.includes(key))) {
        this.cache[key].destroy(true);
        delete this.cache[key];
      }
    });
  }
}

export default GraphicsLoader;
