import { DynamicBody } from 'game/core/physics';
import { SoundSpriteController } from 'game/core/audio';
import { MAX_SOUND_DISTANCE } from 'game/constants/config';

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
   */
  constructor({
    name,
    sounds = {},
    soundSprite,
    ...other
  }) {
    super(other);

    this.sounds = sounds;
    this.name = name;
    this.distanceToPlayer = Number.MAX_VALUE;

    this.soundController = new SoundSpriteController({
      sounds: Object.values(this.sounds),
      soundSprite,
    });
  }

  /**
   * Emit a sound.
   * @param  {String} id The id of the sound.
   */
  emitSound(name) {
    const volume = this.distanceToPlayer > MAX_SOUND_DISTANCE
      ? 0
      : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

    this.soundController.emitSound(name, volume);
  }

  /**
   * Update the entity.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    this.distanceToPlayer = this.getDistanceTo(this.parent.player);

    const volume = this.distanceToPlayer > MAX_SOUND_DISTANCE
      ? 0
      : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

    this.soundController.update(volume);

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