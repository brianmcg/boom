import { DISABLE_SOUND, DISABLE_MUSIC } from '@constants/config';
import Sound from './Sound';

const cache = new Map();

/**
 * Class representing a sound loader.
 */
export default class SoundLoader {
  /**
   * Load a sound
   * @param  {String}   options.src        The path to the sound file.
   * @param  {Object}   options.spriteSrc  The path to the sprite data.
   * @param  {Object}   options.loop       Should the sound loop.
   * @return {Promise}                     Promise that is resolved when the sound is loaded.
   */
  static load({ src, spriteSrc, loop }) {
    if (spriteSrc) {
      return SoundLoader.loadSprite({ src, spriteSrc });
    }

    return SoundLoader.loadSrc({ src, loop });
  }

  /**
   * Load the sound sprite.
   * @param  {String}   options.src        The path to the sound file.
   * @param  {Object}   options.spriteSrc  The path to the sprite data.
   * @return {Promise}                     Promise that is resolved when the sound is loaded.
   */
  static async loadSprite({ src, spriteSrc }) {
    const response = await fetch(spriteSrc);
    const sprite = await response.json();
    const sound = new Sound({ src, sprite, mute: DISABLE_SOUND });

    cache.set(src, sound);

    return sound.load();
  }

  /**
   * Load the sound
   * @param  {String}   options.src   The path to the sound file.
   * @param  {Object}   options.loop  Should the sound loop.
   * @return {Promise}                Promise that is resolved when the sound is loaded.
   */
  static loadSrc({ src, loop }) {
    const sound = new Sound({ src, loop, mute: DISABLE_MUSIC });

    cache.set(src, sound);

    return sound.load();
  }

  /**
   * Unload sounds
   * @param  {Array}  keys The cache keys of the sound to unload.
   */
  static unload(src = [...cache.keys()]) {
    const keys = Array.isArray(src) ? src : [src];

    keys.forEach(key => {
      if (cache.has(key)) {
        cache.get(key).unload();
        cache.delete(key);
      }
    });

    // There is no unload event in howler.js, so I can't return a promise here.
    return Promise.resolve();
  }
}
