/**
 * Class representing and entity sound controller.
 */
class EntitySoundController {
  /**
   * Creates an entity sound controller.
   * @param  {Sound}  options.soundSprite      The sound sprite containing game sounds.
   * @param  {Object} options.sounds           A hash containing entity sound names.
   * @param  {Number} options.maxSoundDistance The maximum distance a player hears a sound.
   */
  constructor({ soundSprite, sounds, maxSoundDistance }) {
    this.soundSprite = soundSprite;
    this.maxSoundDistance = maxSoundDistance;

    this.playingSoundNames = Object.values(sounds).reduce((memo, name) => ({
      ...memo,
      [name]: false,
    }), {});

    this.playingSoundIds = [];
  }

  /**
   * Emit a sound.
   * @param  {String} name             The name of the sound.
   * @param  {Number} options.distance The distance from the player.
   * @return {Number}                  The id of the playing sound.
   */
  emitSound(name, { distance }) {
    const volume = distance > this.maxSoundDistance ? 0 : 1 - distance / this.maxSoundDistance;
    const id = this.soundSprite.play(name);

    this.soundSprite.volume(volume, id);

    this.playingSoundNames[name] = true;
    this.playingSoundIds.push(id);

    this.soundSprite.once('end', () => {
      this.playingSoundNames[name] = false;
      this.playingSoundIds = this.playingSoundIds.filter(playingId => playingId !== id);
    });

    return id;
  }

  /**
   * Update the sounds.
   * @param  {Number} distance The distance from the player.
   */
  update(distance) {
    if (this.playingSoundIds.length) {
      const volume = distance > this.maxSoundDistance ? 0 : 1 - distance / this.maxSoundDistance;

      this.playingSoundIds.forEach(id => this.soundSprite.volume(volume, id));
    }
  }

  /**
   * Pause the sounds.
   */
  pause() {
    this.playingSoundIds.forEach(id => this.soundSprite.pause(id));
  }

  /**
   * Play the sounds.
   */
  play() {
    this.playingSoundIds.forEach(id => this.soundSprite.play(id));
  }

  /**
   * Stop the sounds.
   */
  stop() {
    this.playingSoundIds.forEach(id => this.soundSprite.stop(id));
    this.playingSoundIds = [];
    this.playingSoundNames = Object.keys(this.playingSoundNames)
      .reduce((memo, key) => ({ ...memo, [key]: false }), {});
  }

  /**
   * Check of the sound is playing.
   * @param  {String}  name The name of the sound.
   * @return {Boolean}      The result of the check.
   */
  isPlaying(name) {
    return !!this.playingSoundNames[name];
  }
}

export default EntitySoundController;
