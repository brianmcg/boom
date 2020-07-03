import { MAX_SOUND_DISTANCE } from 'game/constants/config';

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
    const addId = (id) => {
      this.ids[type].push(id);
    };

    const removeId = (id) => {
      this.ids[type] = this.ids[type].filter(soundId => soundId !== id);
    };

    if (!this.ids[type]) {
      this.ids[type] = [];
    }

    sound.on('end', removeId);
    sound.on('stop', removeId);
    sound.on('play', addId);

    this.sounds[type] = sound;
  }

  /**
   * Play a sound.
   * @param  {String} type             The type of sound.
   * @param  {String} name             The name of the sound.
   * @param  {Number} options.distance The distance from the player.
   */
  play(type, name) {
    const sound = this.sounds[type];

    if (sound) {
      const id = sound.play(name);

      sound.volume(volume, id);

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
      this.ids[key] = [];
    });
  }
}

export default SoundPlayer;
