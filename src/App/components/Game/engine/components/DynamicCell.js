import { MAX_SOUND_DISTANCE } from '@constants/config';
import { DynamicCell as PhysicsDynamicCell } from '@game/core/physics';
import { SoundSpriteController } from '@game/core/audio';

export default class DynamicCell extends PhysicsDynamicCell {
  constructor({ soundSprite, sounds, ...other }) {
    super(other);

    this.sounds = sounds;

    this.soundController = new SoundSpriteController({
      sounds: Object.values(this.sounds),
      soundSprite,
    });
  }

  onAdded(parent) {
    this.parent = parent;
  }

  /**
   * Subclass-defined state machine label, and the only way to set it.
   * Returns true only when the state actually changed.
   *
   * The twin of `DynamicEntity.setState`. Both branches descend from `Body`
   * and nothing lower, so this is duplicated rather than shared — physics is
   * the wrong place for it, since nothing there reads a state.
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }

  emitSound(name, loop) {
    const volume =
      this.distanceToPlayer > MAX_SOUND_DISTANCE
        ? 0
        : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

    this.soundController.emitSound(name, volume, loop);
  }

  stopSound(name) {
    this.soundController.stopSound(name);
  }

  update() {
    this.distanceToPlayer = this.getDistanceTo(this.parent.player.pos);

    const volume =
      this.distanceToPlayer > MAX_SOUND_DISTANCE
        ? 0
        : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

    this.soundController.update(volume);
  }

  isPlaying(name) {
    return this.soundController.isPlaying(name);
  }

  play() {
    this.soundController.play();
  }

  pause() {
    this.soundController.pause();
  }

  stop() {
    this.soundController.stop();
  }

  startUpdates() {
    super.startUpdates();
    this.distanceToPlayer = this.getDistanceTo(this.parent.player.pos);
  }

  destroy(options) {
    this.soundController.destroy();
    this.soundController = null;
    this.sounds = null;
    this.parent = null;
    super.destroy(options);
  }
}
