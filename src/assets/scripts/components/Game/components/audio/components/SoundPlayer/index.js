import { Howl } from 'howler';

let effectIds = [];

let effects = null;

let music = null;

let musicId = null;

/**
 * Class representing a sound player.
 */
class SoundPlayer {
  /**
   * Load the sound effects.
   * @return {Object} A promise that is resloved when the sound is loaded.
   */
  static loadEffects({ src, sprite }) {
    const removeId = (id) => {
      effectIds = effectIds.filter(effectId => effectId !== id);
    };

    return new Promise((resolve) => {
      effects = new Howl({
        src: [src],
        sprite,
        onend: removeId,
        onstop: removeId,
        onload: resolve,
      });
    });
  }

  /**
   * Load the music.
   * @param  {Number} index The index of the scene.
   * @return {Object}       A promise that is resolved when the music is loaded.
   */
  static loadMusic(src) {
    return new Promise((resolve) => {
      music = new Howl({
        onload: resolve,
        src: [src],
      });
    });
  }

  /**
   * Play a sound effect.
   * @param  {String} name     The name of the sound.
   * @param  {Number} distance The distance from the player.
   */
  static playEffect(name, distance = 0) {
    const id = effects.play(name);
    const volume = distance > 1000 ? 0 : 1 - distance / 1000;

    effects.volume(volume, id);
    effectIds.push(id);
  }

  /**
   * Play the loaded music.
   */
  static playMusic() {
    musicId = music.play();
  }

  /**
   * Fade out the music.
   */
  static fadeOutMusic() {
    music.fade(1, 0, 1000);
  }

  /**
   * Pause the playing sounds.
   */
  static pause() {
    if (musicId) {
      music.pause(musicId);
    }

    effectIds.forEach((id) => {
      effects.pause(id);
    });
  }

  /**
   * Resume the paused sounds.
   */
  static resume() {
    if (musicId) {
      music.play(musicId);
    }

    effectIds.forEach((id) => {
      effects.play(id);
    });
  }

  /**
   * Stop the playing sounds.
   */
  static stop() {
    if (musicId) {
      music.stop(musicId);
    }

    effectIds.forEach((id) => {
      effects.stop(id);
    });
  }
}

export default SoundPlayer;
