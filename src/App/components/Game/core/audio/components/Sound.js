import { Howl } from 'howler';

export default class Sound extends Howl {
  constructor({ src, sprite, loop = false, mute = false }) {
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

    return new Promise(resolve => {
      this.once('load', () => resolve(this));
    });
  }

  isLoaded() {
    return this.state() === 'loaded';
  }
}
