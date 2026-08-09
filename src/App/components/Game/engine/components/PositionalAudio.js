import { SoundSpriteController } from '@game/core/audio';
import { MAX_SOUND_DISTANCE } from '@constants/config';

/**
 * The sounds a thing in the world makes, at the volume its distance from the
 * player earns.
 *
 * Composed rather than inherited: `Door` and `PushWall` descend from different
 * physics classes, so no single base could sit above both. Holding one of these
 * is also where the distance falloff finally lives once rather than being
 * written out at each call site.
 */
export default class PositionalAudio {
  constructor({ soundSprite, sounds = {} }) {
    this.sounds = sounds;
    this.volume = 0;
    this.controller = new SoundSpriteController({ soundSprite });
  }

  /** Sets the volume every later `emit` uses, and moves what is already playing. */
  setDistance(distance) {
    this.volume =
      distance > MAX_SOUND_DISTANCE ? 0 : 1 - distance / MAX_SOUND_DISTANCE;

    this.controller.update(this.volume);
  }

  /** A missing name is a sound the map did not define, and is not an error. */
  emit(name, loop) {
    if (name) {
      this.controller.emitSound(name, this.volume, loop);
    }
  }

  stop(name) {
    this.controller.stopSound(name);
  }

  isPlaying(name) {
    return this.controller.isPlaying(name);
  }

  play() {
    this.controller.play();
  }

  pause() {
    this.controller.pause();
  }

  stopAll() {
    this.controller.stop();
  }

  destroy() {
    this.controller.destroy();
    this.controller = null;
  }
}
