import Sound from '../Sound';

export default class SoundLoader {
  /**
   * Load a sound
   * @param  {String}   options.src        The path to the sound file.
   * @param  {Object}   options.sprite     The sound sprite data.
   * @return {Promise}                     Promise that is resolved when the sound is loaded.
   */
  static load({ src, sprite }) {
    if (sprite) {
      return SoundLoader.loadSprite({ src, sprite });
    }

    return SoundLoader.loadSrc({ src });
  }

  /**
   * Load the sound sprite.
   * @param  {String}   options.src          The path to the sound file.
   * @param  {Object}   options.sprite       The sound sprite data.
   * @return {Promise}                       Promise that is resolved when the sound is loaded.
   */
  static loadSprite({ src, sprite }) {
    return new Promise((resolve) => {
      const sound = new Sound({ src: [src], sprite });
      sound.onload = resolve(sound);
    });
  }

  /**
   * Load the sound
   * @param  {String} options.src The path to the sound file.
   * @return {Promise}            Promise that is resolwved when the sound is loaded.
   */
  static loadSrc({ src }) {
    return new Promise((resolve) => {
      const sound = new Sound({ src: [src] });
      sound.onload = resolve(sound);
    });
  }

  /**
   * Unload sounds.
   * @param  {Array} sounds The sounds to unload.
   */
  static unload(sounds) {
    sounds.forEach(sound => sound.unload());
  }
}
