import { DynamicBody } from '@game/core/physics';
import { SoundSpriteController } from '@game/core/audio';
import { MAX_SOUND_DISTANCE } from '@constants/config';

const TAIL_INTERVAL = 25;

export default class DynamicEntity extends DynamicBody {
  constructor({ name, sounds = {}, soundSprite, scale = 1, tail, ...other }) {
    super(other);

    this.scale = scale;
    this.sounds = sounds;
    this.name = name;
    this.distanceToPlayer = Number.MAX_VALUE;

    if (tail) {
      this.tail = {
        name: tail.effects.smoke,
        ids: [...Array(tail.length).keys()].map(
          i => `${this.id}_${tail.effects.smoke}_${i}`
        ),
      };

      this.tailTimer = 0;

      this.tailId = 0;
    }

    if (Object.entries(sounds).length) {
      this.soundController = new SoundSpriteController({
        sounds: Object.values(this.sounds),
        soundSprite,
      });
    }
  }

  update(delta, elapsedMS) {
    this.distanceToPlayer = this.getDistanceTo(this.parent.player);

    const volume =
      this.distanceToPlayer > MAX_SOUND_DISTANCE
        ? 0
        : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

    if (this.soundController) {
      this.soundController.update(volume);
    }

    if (this.velocity && this.tail) {
      this.tailTimer += elapsedMS;

      if (this.tailTimer >= TAIL_INTERVAL) {
        this.parent.addEffect({
          x: this.x,
          y: this.y,
          z: this.z,
          sourceId: this.tail.ids[this.tailId],
          scale: Math.random() * 0.5 + 0.5,
        });

        this.tailTimer = 0;
        this.tailId += 1;

        if (this.tailId >= this.tail.ids.length) {
          this.tailId = 0;
        }
      }
    }

    super.update(delta);
  }

  emitSound(name, loop) {
    if (name && this.soundController) {
      const volume =
        this.distanceToPlayer > MAX_SOUND_DISTANCE
          ? 0
          : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

      this.soundController.emitSound(name, volume, loop);
    }
  }

  stopSound(name) {
    if (this.soundController) {
      this.soundController.stopSound(name);
    }
  }

  play() {
    if (this.soundController) {
      this.soundController.play();
    }
  }

  pause() {
    if (this.soundController) {
      this.soundController.pause();
    }
  }

  stop() {
    if (this.soundController) {
      this.soundController.stop();
    }
  }

  isPlaying(name) {
    if (this.soundController) {
      return this.soundController.isPlaying(name);
    }

    return false;
  }

  destroy(options) {
    this.stop();
    this.stopSound();
    this.soundController = null;
    this.sounds = null;
    super.destroy(options);
  }
}
