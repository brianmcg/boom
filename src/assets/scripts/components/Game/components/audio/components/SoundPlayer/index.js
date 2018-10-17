import { Howl } from 'howler';
import { SOUND_FILE_PATH, SOUND_SPRITE } from './constants';

/**
 * Class representing a sound player.
 */
class SoundPlayer {
  /**
   * Creates a sound player.
   * @param  {Boolean} enabled Enable sound.
   */
  constructor() {
    this.effectIds = [];
    this.effects = null;
    this.music = null;
    this.musicId = null;
  }

  /**
   * Load the sound effects.
   * @return {Object} A promise that is resloved when the sound is loaded.
   */
  loadEffects() {
    const removeId = (id) => {
      this.effectIds = this.effectIds.filter(effectId => effectId !== id);
    };

    return new Promise((resolve) => {
      this.effects = new Howl({
        src: [`${SOUND_FILE_PATH}/effects.mp3`],
        sprite: SOUND_SPRITE,
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
  loadMusic(index) {
    return new Promise((resolve) => {
      this.music = new Howl({
        onload: resolve,
        src: [`${SOUND_FILE_PATH}/music-${index}.mp3`],
      });
    });
  }

  /**
   * Play a sound effect.
   * @param  {String} name     The name of the sound.
   * @param  {Number} distance The distance from the player.
   */
  playEffect(name, distance = 0) {
    const id = this.effects.play(name);
    const volume = distance > 1000 ? 0 : 1 - distance / 1000;

    this.effects.volume(volume, id);
    this.effectIds.push(id);
  }

  /**
   * Play the loaded music.
   */
  playMusic() {
    this.musicId = this.music.play();
  }

  /**
   * Fade out the music.
   */
  fadeOutMusic() {
    this.music.fade(1, 0, 1000);
  }

  /**
   * Pause the playing sounds.
   */
  pause() {
    if (this.musicId) {
      this.music.pause(this.musicId);
    }

    this.effectIds.forEach((id) => {
      this.effects.pause(id);
    });
  }

  /**
   * Resume the paused sounds.
   */
  resume() {
    if (this.musicId) {
      this.music.play(this.musicId);
    }

    this.effectIds.forEach((id) => {
      this.effects.play(id);
    });
  }

  /**
   * Stop the playing sounds.
   */
  stop() {
    if (this.musicId) {
      this.music.stop(this.musicId);
    }

    this.effectIds.forEach((id) => {
      this.effects.stop(id);
    });
  }
}

export default SoundPlayer;
