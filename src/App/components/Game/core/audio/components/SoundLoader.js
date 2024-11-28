import { DISABLE_SOUND, DISABLE_MUSIC } from '@constants/config';
import Sound from './Sound';

const cache = new Map();

export default class SoundLoader {
  static load({ src, spriteSrc, loop }) {
    if (spriteSrc) {
      return SoundLoader.loadSprite({ src, spriteSrc });
    }

    return SoundLoader.loadSrc({ src, loop });
  }

  static async loadSprite({ src, spriteSrc }) {
    const response = await fetch(spriteSrc);
    const sprite = await response.json();
    const sound = new Sound({ src, sprite, mute: DISABLE_SOUND });

    cache.set(src, sound);

    return sound.load();
  }

  static loadSrc({ src, loop }) {
    const sound = new Sound({ src, loop, mute: DISABLE_MUSIC });

    cache.set(src, sound);

    return sound.load();
  }

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
