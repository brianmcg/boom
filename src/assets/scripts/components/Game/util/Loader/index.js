import { DataLoader } from '~/core/graphics';
import { SoundLoader } from '~/core/audio';
import { DATA } from '~/constants/assets';
/**
 * Class representing a Loader.
 */
export default class Loader {
  /**
   * Creates a loader.
   */
  constructor() {
    this.dataLoader = new DataLoader();
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
        this.dataLoader.load(data),
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
    this.dataLoader.unload(data);
    this.soundLoader.unload(sound);
  }


  get cache() {
    return {
      data: this.dataLoader.cache,
      sound: this.soundLoader.cache,
    };
  }
}
