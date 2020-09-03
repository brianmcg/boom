import { DynamicCell as PhysicsCell } from 'game/core/physics';
import { SoundSpriteController } from 'game/core/audio';

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
  constructor({ sides = {}, ...other }) {
    super(other);

    this.front = sides.front;
    this.left = sides.left;
    this.back = sides.back;
    this.right = sides.right;
    this.bottom = sides.bottom;
    this.top = sides.top;

    this.onAdded(() => this.initialize());
  }

  /**
   * Initialize the cell.
   */
  initialize() {
    this.distanceToPlayer = this.getDistanceTo(this.parent.player);

    if (!this.soundController) {
      this.soundController = new SoundSpriteController({
        sounds: Object.values(this.sounds),
        soundSprite: this.parent.scene.game.soundSprite,
      });
    }
  }

  /**
   * Emit a sound event.
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
  update() {
    this.distanceToPlayer = this.getDistanceTo(this.parent.player);
    this.soundController.update(this.distanceToPlayer);
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
}

export default DynamicCell;
