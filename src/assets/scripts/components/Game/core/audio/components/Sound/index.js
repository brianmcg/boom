import { Howl } from 'howler';

/**
 * Class representing a sound.
 */
class Sound extends Howl {
  /**
   * @param  {String} options.src     The sound source.
   * @param  {Object} options.sprite  The sprite description.
   */
  constructor({ src, sprite }) {
    super({ src: [src], sprite });
  }
}

export default Sound;
