/**
 * Class representing and entity sound controller.
 */
class SoundSpriteController {
  /**
   * Creates an entity sound controller.
   * @param  {Sound}  options.soundSprite      The sound sprite containing game sounds.
   * @param  {Object} options.sounds           A hash containing entity sound names.
   * @param  {Number} options.maxSoundDistance The maximum distance a player hears a sound.
   */
  constructor({ soundSprite, sounds }) {
    this.soundSprite = soundSprite;
    this.sounds = sounds.reduce((memo, sound) => ({
      ...memo,
      [sound]: null,
    }), {});

    this.playing = [];
  }

  /**
   * Emit a sound.
   * @param  {String} name             The name of the sound.
   * @param  {Number} options.distance The distance from the player.
   * @return {Number}                  The id of the playing sound.
   */
  emitSound(name, volume) {
    const id = this.soundSprite.play(name);

    this.soundSprite.volume(volume, id);
    this.playing.push(id);
    this.sounds[name] = id;
    this.soundSprite.once('end', (endedId) => {
      this.playing.filter(playingId => playingId !== endedId);
    });
  }

  /**
   * Update the sounds.
   * @param  {Number} distance The distance from the player.
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
    const id = this.sounds[name];
    return id ? this.soundSprite.playing(id) : false;
  }
}

export default SoundSpriteController;
