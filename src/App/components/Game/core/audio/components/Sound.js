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

    return new Promise((resolve, reject) => {
      this.once('load', () => resolve(this));
      this.once('loaderror', () => reject(new Error('sound:loaderror')));
    });
  }

  isLoaded() {
    return this.state() === 'loaded';
  }
}
