import { DataLoader } from '~/core/graphics';
import { SoundPlayer } from '~/core/audio';

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
        SoundPlayer.load(sound),
        DataLoader.load(data),
      ]).then(([, { scene }]) => {
        resolve(scene);
      });
    });
  }

  /**
   * Reset the loader.
   * @param  {[type]} options The reset options.
   */
  static reset(options) {
    DataLoader.reset(options);
  }
}
