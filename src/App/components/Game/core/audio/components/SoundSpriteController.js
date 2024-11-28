export default class SoundSpriteController {
  constructor({ soundSprite, sounds }) {
    this.soundSprite = soundSprite;

    this.lastPlayed = sounds.reduce(
      (memo, sound) => ({
        ...memo,
        [sound]: null,
      }),
      {}
    );

    this.playing = [];
  }

  emitSound(name, volume, loop) {
    const id = this.soundSprite.play(name);

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

  stopSound(name) {
    const id = this.lastPlayed[name];

    this.playing = this.playing.filter(playingId => playingId !== id);

    this.soundSprite.stop(id);
  }

  pauseSound(name) {
    const id = this.lastPlayed[name];

    this.soundSprite.pause(id);
  }

  update(volume) {
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

  isPlaying(name) {
    const id = this.lastPlayed[name];

    if (id) {
      return this.soundSprite.playing(id);
    }

    return false;
  }
}
