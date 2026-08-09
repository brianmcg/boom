import { SoundSpriteController } from '@game/core/audio';
import { MAX_SOUND_DISTANCE } from '@constants/config';

/**
 * How sharply volume drops with distance. 1 is a straight line, which is
 * nearly imperceptible until the very edge of range; higher is steeper.
 */
const FALLOFF_EXPONENT = 4;

/**
 * The sounds one thing in the world makes, at the volume its distance from the
 * player earns.
 *
 * A `SoundSpriteController` plays whatever it is told at whatever volume it is
 * told; this adds the only other thing every source in the world needs, which
 * is that far away is quieter. That falloff was written out at four call sites
 * before it lived here.
 *
 * It reads `distanceToPlayer` off its source rather than being told, so there
 * is one number and nothing to keep in step. An earlier version stored the
 * volume and took the distance through a setter, which meant every assignment
 * to `distanceToPlayer` had to remember to pass it on — and the two places that
 * forgot emitted at the previous volume, which on an untouched cell is silence.
 *
 * Composed rather than inherited, because the things that own one — cells and
 * entities — descend from different classes and meet nowhere useful.
 */
export default class PositionalAudio {
  constructor({ soundSprite, source }) {
    this.source = source;
    this.controller = new SoundSpriteController({ soundSprite });
  }

  /**
   * Derived, never stored: the source moves and this must move with it.
   *
   * The ramp is an amplitude and hearing is closer to logarithmic, so a linear
   * one sits near full for most of its range and only drops at the very end.
   * Raising it to a power bends the curve down without moving either end —
   * silent at the limit, full at the listener's feet. Tune with the exponent.
   */
  get volume() {
    const distance = this.source.distanceToPlayer;

    if (distance > MAX_SOUND_DISTANCE) {
      return 0;
    }

    return (1 - distance / MAX_SOUND_DISTANCE) ** FALLOFF_EXPONENT;
  }

  /** Moves what is already playing. Emissions read the volume themselves. */
  update() {
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
    // A back-reference up the graph, and the one kind of field worth clearing.
    this.source = null;
  }
}
