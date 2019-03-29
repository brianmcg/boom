const sounds = {};

const ids = {};

/**
 * Class representing a sound player.
 */
class SoundPlayer {
  /**
   * Add a sound.
   * @param {String} type  The type of sound.
   * @param {Sound}  sound The sound to add.
   */
  static add(type, sound) {
    const removeId = (id) => {
      ids[type] = ids[type].filter(soundId => soundId !== id);
    };

    if (!ids[type]) {
      ids[type] = [];
    }

    sound.on('end', removeId);
    sound.on('stop', removeId);

    sounds[type] = sound;
  }

  /**
   * Play a sound.
   * @param  {String} type     The type of sound.
   * @param  {String} name     The name of the sound.
   * @param  {Number} distance The distance from the player.
   */
  static play(type, name, distance = 0) {
    const sound = sounds[type];

    const id = sound.play(name);

    if (distance) {
      const volume = distance > 1000 ? 0 : 1 - distance / 1000;
      sound.volume(volume, id);
    }

    ids[type].push(id);
  }

  /**
   * Fade out a sound
   * @param  {String} type The type of sound.
   */
  static fadeOut(type) {
    sounds[type].fade(1, 0, 1000);
  }

  /**
   * Pause the playing sounds.
   */
  static pause() {
    Object.keys(ids).forEach((key) => {
      ids[key].forEach((id) => {
        if (sounds[key].playing(id)) {
          sounds[key].pause(id);
        }
      });
    });
  }

  /**
   * Resume the paused sounds.
   */
  static resume() {
    Object.keys(ids).forEach((key) => {
      ids[key].forEach((id) => {
        if (!sounds[key].playing(id)) {
          sounds[key].play(id);
        }
      });
    });
  }

  /**
   * Stop the playing sounds.
   */
  static stop() {
    Object.keys(ids).forEach((key) => {
      ids[key].forEach(id => sounds[key].stop(id));
    });
  }

  /**
   * Unload sounds.
   * @param  {Array}  types The types of the sounds
   */
  static unload(types) {
    types.forEach(type => sounds[type].unload());
  }
}

export default SoundPlayer;
