import { Howl } from 'howler';

/**
 * Class representing a sound.
 */
class Sound extends Howl {
  /**
   * @param  {String} options.src     The sound source.
   * @param  {Object} options.sprite  The sprite description.
   */
  constructor({ src, sprite, loop = false, mute = false }) {
    super({
      src: [src],
      sprite,
      loop,
      mute,
      preload: false,
    });
  }

  /**
   * @return {Promise}  Resolves when sound loads.
   */
  load() {
    super.load();

    return new Promise(resolve => {
      this.once('load', () => resolve(this));
    });
  }

  /**
   * @return {Boolean}  Is the sound loaing.
   */
  isLoaded() {
    return this.state() === 'loaded';
  }
}

export default Sound;
