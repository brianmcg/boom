import Sector from '../Sector';

const AXES = {
  X: 'x',
  Y: 'y',
};

const EMIT_SOUND_EVENT = 'sector:emit:sound';

/**
 * Class representing a dynamic flat sector.
 */
class DynamicSector extends Sector {
  /**
   * Creates a dynamic sector.
   * @param  {Number}  options.x         The x coordinate of the sector.
   * @param  {Number}  options.y         The y coordinate of the sector
   * @param  {Number}  options.width     The width of the sector.
   * @param  {Number}  options.length    The length of the sector.
   * @param  {Number}  options.height    The height of the sector.
   * @param  {Boolean} options.blocking  Is the sector blocking.
   * @param  {String}  options.axis      The axis of the sector.
   * @param  {Number}  options.speed     The speed of the sector.
   * @param  {Object}  options.sounds    The door sounds.
   */
  constructor({
    speed,
    axis,
    sounds,
    ...other
  }) {
    super(other);

    this.sounds = sounds;
    this.speed = speed;
    this.axis = axis;
    this.isDynamic = true;
    this.offset = { x: 0, y: 0 };
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
  emitSound(...options) {
    this.emit(EMIT_SOUND_EVENT, ...options);
  }

  /**
   * Is the axis horizontal.
   * @return  {Boolean}
   */
  isHorizontal() {
    return this.axis === AXES.X;
  }

  /**
   * Is the axis vertical.
   * @return  {Boolean}
   */
  isVertical() {
    return this.axis === AXES.Y;
  }
}

export default DynamicSector;
