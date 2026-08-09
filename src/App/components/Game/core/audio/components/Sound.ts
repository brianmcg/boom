import { Howl, type HowlCallback, type SoundSpriteDefinitions } from 'howler';

/** What a `Sound` needs to construct the `Howl` underneath it. */
export interface SoundOptions {
  /** The single source URL. `Howl` takes a list; this takes one. */
  src: string;
  /** The sprite atlas, for a sound sprite. Absent for a plain track. */
  sprite?: SoundSpriteDefinitions;
  loop?: boolean;
  mute?: boolean;
}

/**
 * A `Howl` that loads on demand and resolves when it has.
 *
 * It holds a howl rather than extending one, because `load` returns a promise
 * of the sound where `Howl.load` returns the sound itself, and TypeScript
 * rejects an override that narrows a return type to something unrelated.
 *
 * Every member is an arrow field rather than a method, so each is bound to the
 * sound for good and may be detached from it. `Game` already does that —
 * `once('end', sound.unload)` — and Howler invokes a listener with the howl as
 * `this`, which a method would receive in place of the sound. The same goes
 * for anything of the form `promise.then(sound.load)`.
 */
export default class Sound {
  private readonly howl: Howl;

  readonly play = (spriteOrId?: string | number): number =>
    this.howl.play(spriteOrId);

  readonly stop = (id?: number): Sound => {
    this.howl.stop(id);

    return this;
  };

  readonly pause = (id?: number): Sound => {
    this.howl.pause(id);

    return this;
  };

  readonly playing = (id?: number): boolean => this.howl.playing(id);

  /**
   * Both forms are in use — `Game` reads the flag, `SoundSpriteController`
   * sets it per sound id — and an arrow field cannot declare overloads without
   * being asserted onto a type that has them.
   */
  readonly loop = ((loop?: boolean, id?: number) => {
    if (loop === undefined) {
      return this.howl.loop();
    }

    this.howl.loop(loop, id);

    return this;
  }) as {
    (): boolean;
    (loop: boolean, id?: number): Sound;
  };

  readonly volume = (volume: number, id: number): Sound => {
    this.howl.volume(volume, id);

    return this;
  };

  readonly fade = (
    from: number,
    to: number,
    duration: number,
    id?: number
  ): Sound => {
    this.howl.fade(from, to, duration, id);

    return this;
  };

  readonly once = (
    event: 'end' | 'fade',
    callback: HowlCallback,
    id?: number
  ): Sound => {
    this.howl.once(event, callback, id);

    return this;
  };

  readonly off = (
    event: 'end' | 'fade',
    callback?: HowlCallback,
    id?: number
  ): Sound => {
    this.howl.off(event, callback, id);

    return this;
  };

  readonly unload = (): null => this.howl.unload();

  /**
   * Starts the load and resolves when it finishes — `preload: false` below
   * means nothing loads until this is called.
   */
  readonly load = (): Promise<this> => {
    this.howl.load();

    return new Promise((resolve, reject) => {
      this.howl.once('load', () => resolve(this));
      this.howl.once('loaderror', () => reject(new Error('sound:loaderror')));
    });
  };

  readonly isLoaded = (): boolean => this.howl.state() === 'loaded';

  constructor({ src, sprite, loop = false, mute = false }: SoundOptions) {
    this.howl = new Howl({
      src: [src],
      sprite,
      loop,
      mute,
      preload: false,
    });
  }
}
