import { Howl } from 'howler';
import { SOUND_FILE_PATH } from './constants';

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

  loadEffects(name, sprite) {
    const removeId = (id) => {
      this.effectIds = this.effectIds.filter(effectId => effectId !== id);
    };

    return new Promise((resolve) => {
      this.effects = new Howl({
        src: [`${SOUND_FILE_PATH}/${name}.mp3`],
        sprite,
        onend: removeId,
        onstop: removeId,
        onload: resolve,
      });
    });
  }

  loadMusic(index) {
    return new Promise((resolve) => {
      this.music = new Howl({
        onload: resolve,
        src: [`${SOUND_FILE_PATH}/music-${index}.mp3`],
      });
    });
  }

  playEffect(name, distance) {
    const id = this.effects.play(name);

    if (distance) {
      const volume = distance > 1000 ? 0 : 1 - distance / 1000;
      this.effects.volume(volume, id);
    }

    this.effectIds.push(id);
  }

  playMusic() {
    this.musicId = this.music.play();
  }

  fadeOutMusic() {
    this.music.fade(1, 0, 1000);
  }

  pause() {
    if (this.musicId) {
      this.music.pause(this.musicId);
    }

    this.effectIds.forEach((id) => {
      this.effects.pause(id);
    });
  }

  resume() {
    if (this.musicId) {
      this.music.play(this.musicId);
    }

    this.effectIds.forEach((id) => {
      this.effects.play(id);
    });
  }

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
