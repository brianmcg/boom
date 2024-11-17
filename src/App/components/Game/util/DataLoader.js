/**
 * Class representing a data loader.
 */
export default class DataLoader {
  /**
   * Load data.
   * @param  {String} options.name The name of the data.
   * @param  {String} options.src  The src of the data.
   * @return {Promise}             Resolved when the data is loaded.
   */
  static async load(src) {
    if (src) {
      const response = await fetch(src);

      return response.json();
    }

    return null;
  }
}
