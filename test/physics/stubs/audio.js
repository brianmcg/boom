// Stand-in for @game/core/audio. Door and PushWall reach it through engine's
// PositionalAudio, which builds one of these in its constructor, plays sounds
// through it, and ticks it on every frame the cell is being updated.
export class SoundSpriteController {
  constructor({ soundSprite }) {
    this.soundSprite = soundSprite;
  }

  emitSound() {}
  stopSound() {}
  update() {}
  play() {}
  pause() {}
  stop() {}
  destroy() {}
  isPlaying() {
    return false;
  }
}
