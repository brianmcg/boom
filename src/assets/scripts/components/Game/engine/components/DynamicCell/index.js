import { MAX_SOUND_DISTANCE, CELL_SIZE } from 'game/constants/config';
import { DynamicCell as PhysicsCell } from 'game/core/physics';
import { SoundSpriteController } from 'game/core/audio';

// const HALF_CELL_SIZE = CELL_SIZE / 2;

/**
 * Class representing a game cell.
 * @extends {Cell}
 */
class DynamicCell extends PhysicsCell {
  /**
   * Creates a cell.
   * @param  {Number} options.x       The x coordinate of the cell.
   * @param  {Number} options.y       The y coordinate of the cell
   * @param  {Number} options.width   The width of the cell.
   * @param  {Number} options.height  The height of the cell.
   * @param  {Object} options.sides   The ids of the sides of the cell.
   */
  constructor({ sides = {}, soundSprite, ...other }) {
    super(other);

    this.front = sides.front;
    this.left = sides.left;
    this.back = sides.back;
    this.right = sides.right;
    this.bottom = sides.bottom;
    this.top = sides.top;

    this.soundController = new SoundSpriteController({
      sounds: Object.values(this.sounds),
      soundSprite,
    });
  }

  /**
   * Called when cell is added to world.
   */
  onAdded(parent) {
    this.parent = parent;
  }

  /**
   * Called when cell is removed from world.
   */
  onRemoved() {
    this.parent = null;
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
  update() {
    this.distanceToPlayer = this.getDistanceTo(this.parent.player);

    const volume = this.distanceToPlayer > MAX_SOUND_DISTANCE
      ? 0
      : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

    this.soundController.update(volume);
  }

  /**
   * Check if a sound is playingSoundNames.
   * @param  {String}  name The name of the sound.
   * @return {Boolean}      [description]
   */
  isPlaying(name) {
    return this.soundController.isPlaying(name);
  }

  /**
   * Play the cell.
   */
  play() {
    this.soundController.play();
  }

  /**
   * Pause the cell.
   */
  pause() {
    this.soundController.pause();
  }

  /**
   * Stop the cell.
   */
  stop() {
    this.soundController.stop();
  }

  /**
   * Add body to update list.
   */
  startUpdates() {
    super.startUpdates();
    this.distanceToPlayer = this.getDistanceTo(this.parent.player);
  }
}

export default DynamicCell;
