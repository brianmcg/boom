import { MAX_SOUND_DISTANCE } from '@constants/config';
import { DynamicCell as PhysicsDynamicCell } from '@game/core/physics';
import { SoundSpriteController } from '@game/core/audio';

export default class DynamicCell extends PhysicsDynamicCell {
  constructor({ sides = {}, soundSprite, sounds, reverse, ...other }) {
    super(other);

    this.front = sides.front;
    this.left = sides.left;
    this.back = sides.back;
    this.right = sides.right;
    this.bottom = sides.bottom;
    this.top = sides.top;
    this.overlay = sides.overlay;
    this.reverse = reverse;
    this.sounds = sounds;

    this.soundController = new SoundSpriteController({
      sounds: Object.values(this.sounds),
      soundSprite,
    });
  }

  onAdded(parent) {
    this.parent = parent;
  }

  onRemoved() {
    this.parent = null;
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
    this.distanceToPlayer = this.getDistanceTo(this.parent.player);

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
    this.distanceToPlayer = this.getDistanceTo(this.parent.player);
  }
}
