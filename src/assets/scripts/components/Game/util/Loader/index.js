import { DataLoader } from '~/core/graphics';
import { SoundPlayer } from '~/core/audio';

/**
 * Class representing a Loader.
 */
export default class Loader {
  /**
   * Load game data.
   * @param  {[type]} options.sound [description]
   * @param  {[type]} options.data  [description]
   * @return {[type]}               [description]
   */
  static load({ sound, data }) {
    return new Promise((resolve) => {
      Promise.all([
        SoundPlayer.load(sound),
        DataLoader.load(data),
      ]).then((response) => {
        resolve(response[1]);
      });
    });
  }

  /**
   * Reset the loader.
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  static reset(options) {
    DataLoader.reset(options);
  }
}
