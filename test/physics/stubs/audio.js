// Stand-in for @game/core/audio. Cell subclasses build a SoundSpriteController
// in their constructor, play sounds through it, and — since engine
// DynamicCell.update sets the volume from the distance to the player — tick it
// on every frame a cell is being updated.
export class SoundSpriteController {
  constructor({ soundSprite, sounds }) {
    this.soundSprite = soundSprite;
    this.sounds = sounds;
  }

  emitSound() {}
  stopSound() {}
  update() {}
  isPlaying() {
    return false;
  }
}
