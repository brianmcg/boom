import type Sound from './Sound';

/** What a `SoundSpriteController` needs to construct. */
export interface SoundSpriteControllerOptions {
  /** The shared sound sprite every name below plays from. */
  soundSprite: Sound;
  /** The sprite names this controller may emit. */
  sounds: string[];
}

/**
 * The last id played for each name this controller knows, or null for a name
 * it has not played yet.
 */
type LastPlayed = Record<string, number | null>;

export default class SoundSpriteController {
  private soundSprite: Sound | null;

  private lastPlayed: LastPlayed | null;

  private playing: number[];

  constructor({ soundSprite, sounds }: SoundSpriteControllerOptions) {
    this.soundSprite = soundSprite;

    this.lastPlayed = sounds.reduce<LastPlayed>(
      (memo, sound) => ({
        ...memo,
        [sound]: null,
      }),
      {}
    );

    this.playing = [];
  }

  emitSound(name: string, volume: number, loop?: boolean) {
    const id = this.soundSprite!.play(name);

    if (loop) {
      this.soundSprite!.loop(true, id);
    }

    this.soundSprite!.volume(volume, id);
    this.playing.push(id);
    this.lastPlayed![name] = id;

    this.soundSprite!.once(
      'end',
      () => {
        if (!loop) {
          this.playing = this.playing.filter(playingId => playingId !== id);
        }
      },
      id
    );
  }

  stopSound(name: string) {
    const id = this.lastPlayed![name];

    this.playing = this.playing.filter(playingId => playingId !== id);

    // A name never played is null here, and Howler matches it against no
    // sound, so this stops nothing. Passing `undefined` instead would stop
    // every sound on the sprite, so the null is carried through as it is.
    this.soundSprite!.stop(id as number);
  }

  pauseSound(name: string) {
    const id = this.lastPlayed![name];

    this.soundSprite!.pause(id as number);
  }

  update(volume: number) {
    this.playing.forEach(id => this.soundSprite!.volume(volume, id));
  }

  pause() {
    this.playing.forEach(id => this.soundSprite!.pause(id));
  }

  play() {
    this.playing.forEach(id => this.soundSprite!.play(id));
  }

  stop() {
    this.playing.forEach(id => this.soundSprite!.stop(id));
  }

  isPlaying(name: string): boolean {
    const id = this.lastPlayed![name];

    if (id) {
      return this.soundSprite!.playing(id);
    }

    return false;
  }

  destroy() {
    this.stop();

    // Remove any `end` handlers still attached to the shared sound sprite for
    // sounds that were stopped (or are looping) without firing `end`.
    this.playing.forEach(id => this.soundSprite!.off('end', undefined, id));

    this.playing = [];
    this.lastPlayed = null;
    this.soundSprite = null;
  }
}
