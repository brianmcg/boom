// Stand-in for @game/core/audio. Cell subclasses build a SoundSpriteController
// in their constructor but only touch it when something plays a sound.
export class SoundSpriteController {
  constructor({ soundSprite, sounds }) {
    this.soundSprite = soundSprite;
    this.sounds = sounds;
  }

  emitSound() {}
  stopSound() {}
  isPlaying() {
    return false;
  }
}
