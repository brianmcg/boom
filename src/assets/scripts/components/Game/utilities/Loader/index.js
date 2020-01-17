import { GraphicsLoader } from 'game/core/graphics';
import { SoundLoader } from 'game/core/audio';
import DataLoader from 'game/utilities/DataLoader';

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
  }

  /**
   * Load game data.
   * @param  {Object}   options.sound     The sound options.
   * @param  {Object}   options.graphics  The graphics options.
   * @param  {Object}   options.data      The data options.
   * @return {Promise}                    Resolves when the assets are loaded.
   */
  load({ sound, graphics, data }) {
    return new Promise((resolve) => {
      Promise.all([
        this.soundLoader.load(sound),
        this.graphicsLoader.load(graphics),
        this.dataLoader.load(data),
      ]).then(([
        loadedSound,
        loadedGraphics,
        loadedData,
      ]) => {
        resolve({
          graphics: loadedGraphics[graphics.name],
          sound: loadedSound,
          data: loadedData,
        });
      });
    });
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

  /**
   * The loader cache
   * @member
   */
  get cache() {
    return {
      graphics: this.graphicsLoader.cache,
      sound: this.soundLoader.cache,
    };
  }
}

export default Loader;
