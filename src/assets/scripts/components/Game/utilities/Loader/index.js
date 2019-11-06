import { GraphicsLoader } from 'game/core/graphics';
import { SoundLoader } from 'game/core/audio';
import { DATA } from 'game/constants/assets';
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
  }

  /**
   * Load game data.
   * @param  {Object}   options.sound The sound options.
   * @param  {Object}   options.data  The data options.
   * @return {Promise}                Resolves when the assets are loaded.
   */
  load({ sound, data }) {
    return new Promise((resolve) => {
      Promise.all([
        this.soundLoader.load(sound),
        this.graphicsLoader.load(data),
      ]).then(([loadedSound, loadedData]) => {
        resolve({
          data: loadedData[DATA.SCENE],
          sound: loadedSound,
        });
      });
    });
  }

  /**
   * Reset the loader
   * @param  {Array} options.data  The data to unload.
   * @param  {Array} options.sound The sounds to unload.
   */
  unload({ data, sound } = {}) {
    this.graphicsLoader.unload(data);
    this.soundLoader.unload(sound);
  }


  get cache() {
    return {
      data: this.graphicsLoader.cache,
      sound: this.soundLoader.cache,
    };
  }
}

export default Loader;
