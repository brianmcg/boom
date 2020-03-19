import { DynamicBody } from 'game/core/physics';

const EMIT_SOUND_EVENT = 'entity:emit:sound';

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
   * @param  {Number}  options.length   The length of the dynamic entity.
   * @param  {Number}  options.height   The height of the dynamic entity.
   * @param  {Number}  options.angle    The angle of the dynamic entity.
   * @param  {Boolean} options.blocking Is the dynamic entity blocking.
   * @param  {String}  options.texture  The texture of entity.
   */
  constructor({ texture, ...other }) {
    super(other);

    this.texture = texture;
  }

  /**
   * Add a callback to the sound event.
   * @param  {Function} callback The callback function.
   */
  onSound(callback) {
    this.on(EMIT_SOUND_EVENT, callback);
  }

  /**
   * Emit a sound event.
   * @param  {String} id The id of the sound.
   */
  emitSound(id) {
    this.emit(EMIT_SOUND_EVENT, id);
  }

  /**
   * Set the state.
   * @param {String} state The state.
   */
  setState(state) {
    const isChanged = this.state !== state;

    if (isChanged) {
      this.state = state;
    }

    return isChanged;
  }
}

export default DynamicEntity;
