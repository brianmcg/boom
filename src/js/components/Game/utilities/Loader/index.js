import { GraphicsLoader } from '@game/core/graphics';
import { SoundLoader } from '@game/core/audio';
import DataLoader from '@game/utilities/DataLoader';

/**
 * Class representing a Loader.
 */
class Loader {
  /**
   * Creates a loader.
   */
  constructor() {
    this.graphicsLoader = new GraphicsLoader();
    this.soundLoader = new SoundLoader();
    this.dataLoader = new DataLoader();

    this.cache = {
      graphics: this.graphicsLoader.cache,
      sound: this.soundLoader.cache,
    };
  }

  /**
   * Load game data.
   * @param  {Object}   options.sound     The sound options.
   * @param  {Object}   options.graphics  The graphics options.
   * @param  {Object}   options.data      The data options.
   * @return {Promise}                    Resolves when the assets are loaded.
   */
  async load({ sound, graphics, data }) {
    const soundResources = this.soundLoader.load(sound);
    const graphicsResources = this.graphicsLoader.load(graphics);
    const dataResources = this.dataLoader.load(data);

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
  unload({ graphics, sound } = {}) {
    this.graphicsLoader.unload(graphics);
    this.soundLoader.unload(sound);
  }
}

export default Loader;
