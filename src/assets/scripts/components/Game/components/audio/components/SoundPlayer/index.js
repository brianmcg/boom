import { Howl } from 'howler';
import { SOUND_ENABLED } from 'game/config';
import { SOUND_FILES } from './constants';

/**
 * Class representing a sound component.
 */
class Sound {
  /**
   * Creates a sound component.
   */
  constructor(enabled) {
    this.sounds = {};
    this.pausedSoundIds = [];
    this.enabled = enabled;
  }

  /**
   * Load a sound.
   * @param  {String}  name   The name of the sound.
   * @param  {Boolean} src    The URL of the sound file.
   * @param  {Boolean} loop   Restart music on complete.
   * @param  {Number}  volume Sound volume.
   * @return {Promise}   Promise object represents loading complete.
   */
  loadSound(name, src = true, loop, volume = 1) {
    return new Promise((resolve) => {
      this.sounds[name] = new Howl({
        src: [src],
        loop,
        volume,
        onload: () => {
          resolve();
        },
      });
    });
  }

  /**
   * Load the game sounds.
   * @return {Promise}   Promise object represents loading complete.
   */
  loadSounds() {
    return Promise.all(SOUND_FILES.map(sound => this.loadSound(...sound)));
  }

  /**
   * Unload music.
   * @param {String} name The name of the sound.
   */
  unloadSound(name) {
    const sound = this.sounds[name];

    if (sound) {
      sound.stop();
      sound.unload();
    }
  }

  /**
   * Reset the pausedSoundIds list to empty.
   */
  resetSounds() {
    this.pausedSoundIds.length = 0;
  }

  /**
   * Unload all sounds.
   */
  unloadSounds() {
    Object.keys(this.sounds).forEach((sound) => {
      sound.stop();
      sound.unload();
    });
  }

  /**
   * Fade the music.
   * @param  {String}    name The name of the sound to fade out.
   */
  fadeOutSound(name) {
    const sound = this.sounds[name];

    if (sound) {
      sound.fade(1, 0, 1000);
    }
  }

  /**
   * Play a sound.
   * @param  {Object} props The sound props.
   * @return {Number}       The sound id.
   */
  playSound(props = {}) {
    const { name, overlay } = props;
    let { distance } = props;

    if (Object.prototype.hasOwnProperty.call(this.sounds, name)) {
      if (overlay !== false && this.sounds[name].playing()) {
        return null;
      }

      const soundId = SOUND_ENABLED ? this.sounds[name].play() : null;

      if (distance) {
        if (distance > 1000) {
          distance = 1000;
        }
        this.sounds[name].volume(1 - distance / 1000, soundId);
      }

      if (typeof props.callback === 'function') {
        this.sounds[name].on('end', () => {
          props.callback();
        });
      }

      return soundId;
    }

    return null;
  }

  /**
   * Pause all sounds.
   * @return {undefined}
   */
  pauseSounds() {
    Object.keys(this.sounds).forEach((key) => {
      const sound = this.sounds[key];

      if (sound.playing()) {
        this.pausedSoundIds.push(sound.pause());
      }
    });
  }

  /**
   * Resume all sounds.
   * @return {undefined}
   */
  resumeSounds() {
    this.pausedSoundIds.forEach(() => {
      this.pausedSoundIds.pop().play();
    });
  }

  /**
   * Stop a sound.
   * @param {String} name The name of the sound to stop.
   * @return {undefined}
   */
  stopSound(name) {
    const sound = this.sounds[name];

    if (sound.playing()) {
      sound.stop();
    }
  }
}

export default Sound;
