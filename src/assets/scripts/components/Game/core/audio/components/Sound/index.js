import { Howl } from 'howler';

/**
 * Class representing a sound.
 */
class Sound extends Howl {
  /**
   * @param  {String} options.src     The sound source.
   * @param  {Object} options.sprite  The sprite description.
   */
  constructor({
    src,
    sprite,
    loop = false,
    mute = false,
  }) {
    super({
      src: [src],
      sprite,
      loop,
      mute,
      preload: false,
    });
  }

  load() {
    super.load();

    return new Promise(resolve => this.on('load', () => resolve(this)));
  }
}

export default Sound;
