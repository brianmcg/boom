import { DynamicBody } from 'game/core/physics';
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

  initialize() {
    if (!this.isInitialized) {
      this.soundSprite = this.parent.scene.game.soundSprite;

      this.playingSoundNames = Object.values(this.sounds).reduce((memo, name) => ({
        ...memo,
        [name]: false,
      }), {});

      this.isInitialized = true;
      this.playingSoundIds = [];
    }
  }

  /**
   * Emit a sound event.
   * @param  {String} id The id of the sound.
   */
  emitSound(name) {
    const id = this.soundSprite.play(name);

    const volume = this.distanceToPlayer > MAX_SOUND_DISTANCE
      ? 0
      : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

    this.soundSprite.volume(volume, id);

    this.playingSoundNames[name] = true;
    this.playingSoundIds.push(id);

    this.soundSprite.once('end', () => {
      this.playingSoundNames[name] = false;
      this.playingSoundIds = this.playingSoundIds.filter(playingId => playingId !== id);
    });

    return id;
  }

  /**
   * Update the entity.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    this.distanceToPlayer = this.getDistanceTo(this.parent.player);

    if (this.playingSoundIds.length) {
      const volume = this.distanceToPlayer > MAX_SOUND_DISTANCE
        ? 0
        : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

      this.playingSoundIds.forEach(id => this.soundSprite.volume(volume, id));
    }

    super.update(delta);
  }

  /**
   * Check if a sound is playingSoundNames.
   * @param  {String}  name The name of the sound.
   * @return {Boolean}      [description]
   */
  isPlaying(name) {
    return !!this.playingSoundNames[name];
  }
}

export default DynamicEntity;
