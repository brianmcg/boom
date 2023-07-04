/**
 * Class representing a data loader.
 */
class DataLoader {
  /**
   * Creates a data loader.
   */
  constructor() {
    this.cache = {};
  }

  /**
   * Load data.
   * @param  {String} options.name The name of the data.
   * @param  {String} options.src  The src of the data.
   * @return {Promise}             Resolved when the data is loaded.
   */
  async load(options) {
    if (options) {
      const { name, src } = options;
      const response = await fetch(src);
      const data = await response.json();

      this.cache[name] = data;

      return data;
    }

    return null;
  }

  /**
   * Unload the data.
   * @param  {Array}  keys A list of cache keys to unload.
   */
  unload(keys = []) {
    if (keys.length) {
      keys.forEach(key => {
        delete this.cache[key];
      });
    } else {
      this.cache = {};
    }
  }
}

export default DataLoader;
