import { DynamicBody } from 'game/core/physics';
import { SoundSpriteController } from 'game/core/audio';
import { MAX_SOUND_DISTANCE } from 'game/constants/config';

const TAIL_INTERVAL = 25;

/**
 * Class representing a dynamic entity.
 * @extends {DynamicBody}
 */
class DynamicEntity extends DynamicBody {
  /**
   * Creates a dynamic entity.
   * @param  {Number}  options.x        The x coordinate of the dynamic entity.
   * @param  {Number}  options.y        The y coordinate of the dynamic entity
   * @param  {Number}  options.width    The width of the dynamic entity.
   * @param  {Number}  options.height   The height of the dynamic entity.
   * @param  {Number}  options.angle    The angle of the dynamic entity.
   * @param  {Boolean} options.blocking Is the dynamic entity blocking.
   * @param  {String}  options.texture  The texture of entity.
   * @param  {String}  options.sounds   The sounds of entity.
   * @param  {Boolean} options.scale    The scale of the entity.
   */
  constructor({
    name,
    sounds = {},
    soundSprite,
    scale = 1,
    tail,
    ...other
  }) {
    super(other);

    this.scale = scale;
    this.sounds = sounds;
    this.name = name;
    this.distanceToPlayer = Number.MAX_VALUE;

    if (tail) {
      this.tail = {
        name: tail.effects.smoke,
        ids: [...Array(tail.length).keys()].map(i => `${this.id}_${tail.effects.smoke}_${i}`),
      };

      this.tailTimer = 0;

      this.tailId = 0;
    }

    this.soundController = new SoundSpriteController({
      sounds: Object.values(this.sounds),
      soundSprite,
    });
  }

  /**
   * Emit a sound.
   * @param {String}  name The name of the sound.
   * @param {Boolean} loop Loop the sound.
   */
  emitSound(name, loop) {
    const volume = this.distanceToPlayer > MAX_SOUND_DISTANCE
      ? 0
      : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

    this.soundController.emitSound(name, volume, loop);
  }

  /**
   * Stop a sound.
   * @param  {String} name The name of the sound.
   */
  stopSound(name) {
    this.soundController.stopSound(name);
  }

  /**
   * Update the entity.
   * @param  {Number} delta The delta time.
   */
  update(delta, elapsedMS) {
    this.distanceToPlayer = this.getDistanceTo(this.parent.player);

    const volume = this.distanceToPlayer > MAX_SOUND_DISTANCE
      ? 0
      : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

    this.soundController.update(volume);

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
   * Play the entity.
   */
  play() {
    this.soundController.play();
  }

  /**
   * Pause the entity.
   */
  pause() {
    this.soundController.pause();
  }

  /**
   * Stop the entity.
   */
  stop() {
    this.soundController.stop();
  }

  /**
   * Check if a sound is playing..
   * @param  {String}  name The name of the sound.
   * @return {Boolean}      The result of the check.
   */
  isPlaying(name) {
    return this.soundController.isPlaying(name);
  }
}

export default DynamicEntity;
