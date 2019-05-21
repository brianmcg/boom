const MAX_DISTANCE = 1000;

/**
 * Class representing a sound player.
 */
class SoundPlayer {
  /**
   * Creates a sound player.
   */
  constructor() {
    this.sounds = {};
    this.ids = {};
  }

  /**
   * Add a sound.
   * @param {String} type  The type of sound.
   * @param {Sound}  sound The sound to add.
   */
  add(type, sound) {
    const removeId = (id) => {
      this.ids[type] = this.ids[type].filter(soundId => soundId !== id);
    };

    if (!this.ids[type]) {
      this.ids[type] = [];
    }

    sound.on('end', removeId);
    sound.on('stop', removeId);

    this.sounds[type] = sound;
  }

  /**
   * Play a sound.
   * @param  {String} type     The type of sound.
   * @param  {String} name     The name of the sound.
   * @param  {Number} distance The distance from the player.
   */
  play(type, name, distance = 0) {
    const sound = this.sounds[type];

    if (sound) {
      const id = sound.play(name);

      if (distance) {
        const volume = distance > MAX_DISTANCE ? 0 : 1 - distance / MAX_DISTANCE;
        sound.volume(volume, id);
      }

      this.ids[type].push(id);
    }
  }

  /**
   * Fade out a sound
   * @param  {String} type The type of sound.
   */
  fade(type) {
    const sound = this.sounds[type];

    if (sound) {
      sound.fade(1, 0, 1000);
    }
  }

  /**
   * Pause the playing sounds.
   */
  pause() {
    Object.keys(this.ids).forEach((key) => {
      this.ids[key].forEach((id) => {
        if (this.sounds[key].playing(id)) {
          this.sounds[key].pause(id);
        }
      });
    });
  }

  /**
   * Resume the paused sounds.
   */
  resume() {
    Object.keys(this.ids).forEach((key) => {
      this.ids[key].forEach((id) => {
        if (!this.sounds[key].playing(id)) {
          this.sounds[key].play(id);
        }
      });
    });
  }

  /**
   * Stop the playing sounds.
   */
  stop() {
    Object.keys(this.ids).forEach((key) => {
      this.ids[key].forEach(id => this.sounds[key].stop(id));
    });
  }
}

export default SoundPlayer;
