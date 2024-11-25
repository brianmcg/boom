import { GraphicsLoader } from '@game/core/graphics';
import { SoundLoader } from '@game/core/audio';
import DataLoader from '@game/util/DataLoader';

/**
 * Class representing a Loader.
 */
export default class Loader {
  /**
   * Load game data.
   * @param  {Object}   options.sound     The sound options.
   * @param  {Object}   options.graphics  The graphics options.
   * @param  {Object}   options.data      The data options.
   * @return {Promise}                    Resolves when the assets are loaded.
   */
  static async load({ sound, graphics, data }) {
    const soundResources = SoundLoader.load(sound);
    const graphicsResources = GraphicsLoader.load(graphics);
    const dataResources = DataLoader.load(data);

    return {
      graphics: await graphicsResources,
      sound: await soundResources,
      data: await dataResources,
    };
  }

  /**
   * Reset the loader
   * @param  {Array} options.graphics   The graphics to unload.
   * @param  {Array} options.sound      The sounds to unload.
   */
  static async unload({ graphics, sound } = {}) {
    const soundPromise = SoundLoader.unload(sound);
    const graphicsPromise = GraphicsLoader.unload(graphics);

    return {
      sound: await soundPromise,
      graphics: await graphicsPromise,
    };
  }
}
