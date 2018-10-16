import { Howl } from 'howler';

/**
 * Class representing a sound player.
 */
class SoundPlayer {
  /**
   * Creates a sound player.
   * @param  {Boolean} enabled Enable sound.
   */
  constructor() {
    this.pausedIds = [];
    this.playingIds = [];
    this.musicId = null;
  }

  load(props) {
    if (Object.prototype.hasOwnProperty.call(props, 'sprite')) {
      return new Promise((resolve) => {
        this.effects = new Howl({
          onload: resolve,
          onend: (soundId) => { this.playingIds = this.playingIds.filter(id => id !== soundId); },
          ...props,
        });
      });
    }

    return new Promise((resolve) => {
      this.music = new Howl({ onload: resolve, ...props });
    });
  }

  playSound(name) {
    this.playingIds.push(this.effects.play(name));
  }

  playMusic() {
    this.musicId = this.music.play();
  }

  fadeOutMusic() {
    this.music.fade(1, 0, 1000);
  }

  pause() {
    this.music.pause();

    this.playingIds.forEach((id) => {
      this.effects.pause(id);
    });

    this.pausedIds = [...this.playingIds];
    this.playingIds.length = 0;
  }

  resume() {
    this.music.play(this.musicId);

    this.pausedIds.forEach((id) => {
      this.effects.play(id);
    });
  }
}

export default SoundPlayer;
