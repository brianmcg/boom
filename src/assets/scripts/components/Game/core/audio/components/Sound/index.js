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
    });
  }
}

export default Sound;
