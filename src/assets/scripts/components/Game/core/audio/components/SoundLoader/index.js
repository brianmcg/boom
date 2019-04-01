import Sound from '../Sound';

/**
 * Class representing a sound loader.
 */
export default class SoundLoader {
  /**
   * Creates a sound loader.
   */
  constructor() {
    this.cache = {};
  }

  /**
   * Load a sound
   * @param  {String}   options.name       The name of the sound file.
   * @param  {String}   options.src        The path to the sound file.
   * @param  {Object}   options.sprite     The sound sprite data.
   * @return {Promise}                     Promise that is resolved when the sound is loaded.
   */
  load({ name, src, sprite }) {
    if (sprite) {
      return this.loadSprite({ name, src, sprite });
    }

    return this.loadSrc({ name, src });
  }

  /**
   * Load the sound sprite.
   * @param  {String}   options.name       The name of the sound file.
   * @param  {String}   options.src        The path to the sound file.
   * @param  {Object}   options.sprite     The sound sprite data.
   * @return {Promise}                     Promise that is resolved when the sound is loaded.
   */
  loadSprite({ name, src, sprite }) {
    return new Promise((resolve) => {
      const sound = new Sound({ src: [src], sprite });
      this.cache[name] = sound;
      sound.onload = resolve(sound);
    });
  }

  /**
   * Load the sound
   * @param  {String}   options.name  The name of the sound file.
   * @param  {String}   options.src   The path to the sound file.
   * @return {Promise}                Promise that is resolwved when the sound is loaded.
   */
  loadSrc({ name, src }) {
    return new Promise((resolve) => {
      const sound = new Sound({ src: [src] });
      this.cache[name] = sound;
      sound.onload = resolve(sound);
    });
  }

  /**
   * Unload sounds
   * @param  {Array}  keys The cache keys of the sound to unload.
   */
  unload(keys = []) {
    Object.keys(this.cache).forEach((key) => {
      if (this.cache[key] && (!keys.length || keys.includes(key))) {
        this.cache[key].unload();
        delete this.cache[key];
      }
    });
  }
}
