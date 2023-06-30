import { DISABLE_SOUND, DISABLE_MUSIC } from '@game/constants/config';
import Sound from '../Sound';

/**
 * Class representing a sound loader.
 */
class SoundLoader {
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
   * @param  {Object}   options.spriteSrc  The path to the sprite data.
   * @param  {Object}   options.loop       Should the sound loop.
   * @return {Promise}                     Promise that is resolved when the sound is loaded.
   */
  load({
    name,
    src,
    spriteSrc,
    loop,
  }) {
    if (spriteSrc) {
      return this.loadSprite({ name, src, spriteSrc });
    }

    return this.loadSrc({ name, src, loop });
  }

  /**
   * Load the sound sprite.
   * @param  {String}   options.name       The name of the sound file.
   * @param  {String}   options.src        The path to the sound file.
   * @param  {Object}   options.spriteSrc  The path to the sprite data.
   * @return {Promise}                     Promise that is resolved when the sound is loaded.
   */
  async loadSprite({ name, src, spriteSrc }) {
    const response = await fetch(spriteSrc);
    const sprite = await response.json();
    const sound = new Sound({ src, sprite, mute: DISABLE_SOUND });

    this.cache[name] = sound;

    return sound.load();
  }

  /**
   * Load the sound
   * @param  {String}   options.name  The name of the sound file.
   * @param  {String}   options.src   The path to the sound file.
   * @return {Promise}                Promise that is resolved when the sound is loaded.
   */
  async loadSrc({ name, src, loop }) {
    const sound = await new Sound({ src, loop, mute: DISABLE_MUSIC });

    this.cache[name] = sound;

    return sound.load();
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

export default SoundLoader;
