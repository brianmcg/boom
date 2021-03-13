/**
 * Class representing and sound sprite controller.
 */
class SoundSpriteController {
  /**
   * Creates an sound sprite controller.
   * @param  {Sound}  options.soundSprite      The sound sprite containing game sounds.
   * @param  {Object} options.sounds           A hash containing entity sound names.
   */
  constructor({ soundSprite, sounds }) {
    this.soundSprite = soundSprite;

    this.lastPlayed = sounds.reduce((memo, sound) => ({
      ...memo,
      [sound]: null,
    }), {});

    this.playing = [];
  }

  /**
   * Emit a sound.
   * @param  {String}  name     The name of the sound.
   * @param  {Number}  volume   The volume to play the sound at.
   * @param  {Boolean} loop     Loop the sound.
   */
  emitSound(name, volume, loop) {
    const id = this.soundSprite.play(name);

    if (loop) {
      this.soundSprite.loop(true, id);
    }

    this.soundSprite.volume(volume, id);
    this.playing.push(id);
    this.lastPlayed[name] = id;

    this.soundSprite.once('end', () => {
      this.playing = this.playing.filter(playingId => playingId !== id);
    }, id);
  }

  /**
   * Stop a sound.
   * @param  {String} name The name of the sound.
   */
  stopSound(name) {
    const id = this.lastPlayed[name];

    this.soundSprite.stop(id);
  }

  /**
   * Update the sounds.
   * @param  {Number} volume The volume to play the sound at.
   */
  update(volume) {
    this.playing.forEach(id => this.soundSprite.volume(volume, id));
  }

  /**
   * Pause the sounds.
   */
  pause() {
    this.playing.forEach(id => this.soundSprite.pause(id));
  }

  /**
   * Play the sounds.
   */
  play() {
    this.playing.forEach(id => this.soundSprite.play(id));
  }

  /**
   * Stop the sounds.
   */
  stop() {
    this.playing.forEach(id => this.soundSprite.stop(id));
  }

  /**
   * Check of the sound is playing.
   * @param  {String}  name The name of the sound.
   * @return {Boolean}      The result of the check.
   */
  isPlaying(name) {
    const id = this.lastPlayed[name];

    if (id) {
      return this.soundSprite.playing(id);
    }

    return false;
  }
}

export default SoundSpriteController;
