import type { SoundSpriteDefinitions } from 'howler';
import { DISABLE_SOUND, DISABLE_MUSIC } from '@constants/config';
import Sound from './Sound';

/** A sound asset as the asset constants declare it. */
export interface SoundAsset {
  src: string;
  /** The sprite atlas URL. Present only for the game-wide sound sprite. */
  spriteSrc?: string;
  loop?: boolean;
}

const cache = new Map<string, Sound>();

export default class SoundLoader {
  static load({ src, spriteSrc, loop }: SoundAsset): Promise<Sound> {
    if (spriteSrc) {
      return SoundLoader.loadSprite({ src, spriteSrc });
    }

    return SoundLoader.loadSrc({ src, loop });
  }

  static async loadSprite({
    src,
    spriteSrc,
  }: {
    src: string;
    spriteSrc: string;
  }): Promise<Sound> {
    const response = await fetch(spriteSrc);
    const sprite = (await response.json()) as SoundSpriteDefinitions;
    const sound = new Sound({ src, sprite, mute: DISABLE_SOUND });

    cache.set(src, sound);

    return sound.load();
  }

  static loadSrc({
    src,
    loop,
  }: {
    src: string;
    loop?: boolean;
  }): Promise<Sound> {
    const sound = new Sound({ src, loop, mute: DISABLE_MUSIC });

    cache.set(src, sound);

    return sound.load();
  }

  static unload(src: string | string[] = [...cache.keys()]): Promise<void> {
    const keys = Array.isArray(src) ? src : [src];

    keys.forEach(key => {
      if (cache.has(key)) {
        cache.get(key)!.unload();
        cache.delete(key);
      }
    });

    // There is no unload event in howler.js, so I can't return a promise here.
    return Promise.resolve();
  }
}
