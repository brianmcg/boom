import { DynamicCell as PhysicsCell } from 'game/core/physics';
import { MAX_SOUND_DISTANCE } from 'game/constants/config';

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
    this.soundSprite = this.parent.scene.game.soundSprite;

    this.playingSoundNames = Object.values(this.sounds).reduce((memo, name) => ({
      ...memo,
      [name]: false,
    }), {});

    this.playingSoundIds = [];
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
  }

  /**
   * Update the entity.
   * @param  {Number} delta The delta time.
   */
  update() {
    this.distanceToPlayer = this.getDistanceTo(this.parent.player);

    if (this.playingSoundIds.length) {
      const volume = this.distanceToPlayer > MAX_SOUND_DISTANCE
        ? 0
        : 1 - this.distanceToPlayer / MAX_SOUND_DISTANCE;

      this.playingSoundIds.forEach(id => this.soundSprite.volume(volume, id));
    }
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

export default DynamicCell;
