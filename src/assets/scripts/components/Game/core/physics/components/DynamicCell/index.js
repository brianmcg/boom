import { CELL_SIZE } from 'game/constants/config';
import Cell from '../Cell';

/**
 * Class representing a dynamic flat cell.
 */
class DynamicCell extends Cell {
  /**
   * Creates a dynamic cell.
   * @param  {Number}  options.x         The x coordinate of the cell.
   * @param  {Number}  options.y         The y coordinate of the cell
   * @param  {Number}  options.width     The width of the cell.
   * @param  {Number}  options.height    The height of the cell.
   * @param  {Boolean} options.blocking  Is the cell blocking.
   * @param  {String}  options.axis      The axis of the cell.
   * @param  {Number}  options.speed     The speed of the cell.
   * @param  {Object}  options.sounds    The door sounds.
   */
  constructor({
    speed,
    sounds,
    autoPlay = false,
    ...other
  }) {
    super(other);

    this.speed = speed * CELL_SIZE;
    this.sounds = sounds;
    this.isDynamic = true;
    this.autoPlay = autoPlay;
  }

  /**
   * Add body to update list.
   */
  startUpdates() {
    if (this.parent) {
      this.parent.startUpdates(this);
    }
  }

  /**
   * Remove body from update list.
   */
  stopUpdates() {
    if (this.parent) {
      this.parent.stopUpdates(this);
    }
  }
}

export default DynamicCell;
