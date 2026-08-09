import type Sound from './Sound';

/** What a `SoundSpriteController` needs to construct. */
export interface SoundSpriteControllerOptions {
  /** The shared sound sprite every name plays from. */
  soundSprite: Sound;
}

/**
 * The last id played for each name, filled in as names are played. A name not
 * played yet is absent, and reads as undefined.
 */
type LastPlayed = Record<string, number | undefined>;

export default class SoundSpriteController {
  private readonly soundSprite: Sound;

  private readonly lastPlayed: LastPlayed;

  private playing: number[];

  constructor({ soundSprite }: SoundSpriteControllerOptions) {
    this.soundSprite = soundSprite;
    this.lastPlayed = {};
    this.playing = [];
  }

  emitSound(name: string, volume: number, loop?: boolean) {
    const id = this.soundSprite.play(name);

    // Null is a name the sprite does not define, so there is no sound to
    // configure or remember. Registering the handler below against it would be
    // worse than useless: Howler fires a listener whose id is falsy on every
    // sound's end, not on this one's.
    if (id === null) {
      return;
    }

    if (loop) {
      this.soundSprite.loop(true, id);
    }

    this.soundSprite.volume(volume, id);
    this.playing.push(id);
    this.lastPlayed[name] = id;

    this.soundSprite.once(
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
    const id = this.lastPlayed[name];

    // Nothing to stop, and nothing that may be passed on: Howler resolves an
    // undefined id to every id it holds, so an unknown name would stop the
    // whole shared sprite rather than one sound.
    if (typeof id !== 'number') {
      return;
    }

    this.playing = this.playing.filter(playingId => playingId !== id);

    this.soundSprite.stop(id);
  }

  pauseSound(name: string) {
    const id = this.lastPlayed[name];

    if (typeof id !== 'number') {
      return;
    }

    this.soundSprite.pause(id);
  }

  update(volume: number) {
    this.playing.forEach(id => this.soundSprite.volume(volume, id));
  }

  pause() {
    this.playing.forEach(id => this.soundSprite.pause(id));
  }

  play() {
    this.playing.forEach(id => this.soundSprite.play(id));
  }

  stop() {
    this.playing.forEach(id => this.soundSprite.stop(id));
  }

  isPlaying(name: string): boolean {
    const id = this.lastPlayed[name];

    if (typeof id !== 'number') {
      return false;
    }

    return this.soundSprite.playing(id);
  }

  destroy() {
    this.stop();

    // Remove any `end` handlers still attached to the shared sound sprite for
    // sounds that were stopped (or are looping) without firing `end`.
    this.playing.forEach(id => this.soundSprite.off('end', undefined, id));

    this.playing = [];
  }
}
