import { DataLoader } from '~/core/graphics';
import { SoundPlayer, SoundLoader } from '~/core/audio';
import { DATA_TYPES } from '~/constants/assets';
/**
 * Class representing a Loader.
 */
export default class Loader {
  /**
   * Load game data.
   * @param  {Object}   options.sound The sound options.
   * @param  {Object}   options.data  The data options.
   * @return {Promise}                Resolves when the assets are loaded.
   */
  static load({ sound, data }) {
    return new Promise((resolve) => {
      Promise.all([
        SoundLoader.load(sound),
        DataLoader.load(data),
      ]).then(([loadedSound, loadedData]) => {
        resolve({
          data: loadedData[DATA_TYPES.SCENE],
          sound: loadedSound,
        });
      });
    });
  }

  /**
   * Reset the loader.
   * @param  {[type]} options The reset options.
   */
  static unload(...options) {
    DataLoader.unload(...options);
    SoundLoader.unload([]);
  }
}
