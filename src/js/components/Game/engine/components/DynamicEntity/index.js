import { DynamicBody } from '@game/core/physics';
import { SoundSpriteController } from '@game/core/audio';
import { MAX_SOUND_DISTANCE } from '@game/constants/config';

const TAIL_INTERVAL = 25;

/**
 * Class representing a dynamic entity.
 * @extends {DynamicBody}
 */
class DynamicEntity extends DynamicBody {
  /**
   * Creates a dynamic entity.
   * @param  {Number}  options.x            The x coordinate of the entity.
   * @param  {Number}  options.y            The y coordinate of the entity.
   * @param  {Number}  options.z            The z coordinate of the entity.
   * @param  {Number}  options.width        The width of the entity.
   * @param  {Number}  options.height       The length of the entity.
   * @param  {Number}  options.height       The height of the entity.
   * @param  {Boolean} options.blocking     The blocking value of the entity.
   * @param  {Number}  options.anchor       The anchor of the entity.
   * @param  {Number}  options.angle        The angle of the entity.
   * @param  {Number}  options.weight       The weight of the entity.
   * @param  {Number}  options.autoPlay     The autopPlay value of the entity.
   * @param  {String}  options.name         The name of the entity.
   * @param  {Object}  options.sounds       The entity sounds.
   * @param  {Object}  options.soundSprite  The entity sound sprite.
   * @param  {Number}  options.scale        The entity scale.
   * @param  {Object}  options.tail         The entity tail.
   */
  constructor({ name, sounds = {}, soundSprite, scale = 1, tail, ...other }) {
    super(other);

    this.scale = scale;
    this.sounds = sounds;
    this.name = name;
    this.distanceToPlayer = 0;

    if (tail) {
      this.tail = {
        name: tail.effects.smoke,
        ids: [...Array(tail.length).keys()].map(i => `${this.id}_${tail.effects.smoke}_${i}`),
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

  /**
   * Update the entity.
   * @param  {Number} delta     The delta time.
   * @param  {Number} elapsedMS The elapsed time in milliseconds.
   */
  update(delta, elapsedMS) {
    this.distanceToPlayer = this.getDistanceTo(this.parent.player);

    const volume =
      this.distanceToPlayer > MAX_SOUND_DISTANCE
        ? 0
        : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

    if (this.soundController) {
      this.soundController.update(volume);
    }

    if (this.tail) {
      this.tailTimer += elapsedMS;

      if (this.tailTimer >= TAIL_INTERVAL) {
        this.parent.addEffect({
          x: this.x,
          y: this.y,
          z: this.z,
          sourceId: this.tail.ids[this.tailId],
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

  /**
   * Emit a sound.
   * @param {String}  name The name of the sound.
   * @param {Boolean} loop Loop the sound.
   */
  emitSound(name, loop) {
    if (name && this.soundController) {
      const volume =
        this.distanceToPlayer > MAX_SOUND_DISTANCE
          ? 0
          : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

      this.soundController.emitSound(name, volume, loop);
    }
  }

  /**
   * Stop a sound.
   * @param  {String} name The name of the sound.
   */
  stopSound(name) {
    if (this.soundController) {
      this.soundController.stopSound(name);
    }
  }

  /**
   * Play the entity.
   */
  play() {
    if (this.soundController) {
      this.soundController.play();
    }
  }

  /**
   * Pause the entity.
   */
  pause() {
    if (this.soundController) {
      this.soundController.pause();
    }
  }

  /**
   * Stop the entity.
   */
  stop() {
    if (this.soundController) {
      this.soundController.stop();
    }
  }

  /**
   * Check if a sound is playing..
   * @param  {String}  name The name of the sound.
   * @return {Boolean}      The result of the check.
   */
  isPlaying(name) {
    if (this.soundController) {
      return this.soundController.isPlaying(name);
    }

    return false;
  }
}

export default DynamicEntity;
