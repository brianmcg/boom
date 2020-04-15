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
  constructor({ name, sounds, ...other }) {
    super(other);

    this.sounds = sounds;
    this.name = name;
    this.distanceToPlayer = Number.MAX_VALUE;

    this.onAdded(() => this.initialize());
  }

  /**
   * Initialize the entity.
   */
  initialize() {
    this.distanceToPlayer = this.getDistanceTo(this.parent.player);

    if (!this.soundController) {
      this.soundController = new SoundSpriteController({
        sounds: Object.values(this.sounds),
        soundSprite: this.parent.scene.game.soundSprite,
        maxSoundDistance: MAX_SOUND_DISTANCE,
      });
    }
  }

  /**
   * Emit a sound.
   * @param  {String} id The id of the sound.
   */
  emitSound(name) {
    this.soundController.emitSound(name, {
      distance: this.distanceToPlayer,
    });
  }

  /**
   * Update the entity.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    this.distanceToPlayer = this.getDistanceTo(this.parent.player);
    this.soundController.update(this.distanceToPlayer);
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
