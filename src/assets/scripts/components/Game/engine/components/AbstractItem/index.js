import { CELL_SIZE } from 'game/constants/config';
import DynamicEntity from '../DynamicEntity';

const SCALE_INCREMENT = 0.05;

/**
 * Class representing an item.
 * @extends {DynamicEntity}
 */
class AbstractItem extends DynamicEntity {
  /**
   * Creates an item.
   * @param  {Number}  options.x              The x coordinate of the item.
   * @param  {Number}  options.y              The y coordinate of the item.
   * @param  {Number}  options.z              The z coordinate of the item.
   * @param  {Number}  options.width          The width of the item.
   * @param  {Number}  options.height         The length of the item.
   * @param  {Number}  options.height         The height of the item.
   * @param  {Boolean} options.blocking       The blocking value of the item.
   * @param  {Number}  options.anchor         The anchor of the item.
   * @param  {Number}  options.angle          The angle of the item.
   * @param  {Number}  options.weight         The weight of the item.
   * @param  {Number}  options.autoPlay       The autopPlay value of the item.
   * @param  {String}  options.name           The name of the item.
   * @param  {Object}  options.sounds         The item sounds.
   * @param  {Object}  options.soundSprite    The item sound sprite.
   * @param  {Number}  options.scale          The item scale.
   * @param  {Object}  options.tail           The item tail.
   * @param  {String}  options.type           The type of item.
   * @param  {Number}  options.floorOffset    The floor offset.
   * @param  {Number}  options.spawnTime      The time to respawn.
   */
  constructor({
    type,
    floorOffset,
    spawnTime,
    ...other
  }) {
    super({ blocking: false, autoPlay: false, ...other });

    this.isItem = true;
    this.type = type;
    this.spawnTime = spawnTime;
    this.timer = 0;

    if (floorOffset) {
      this.z = CELL_SIZE * floorOffset * 0.75;
    }

    if (this.constructor === AbstractItem) {
      throw new TypeError('Can not construct abstract class.');
    }
  }

  /**
   * Called when body is added to world.
   * @param  {World} parent  The world that the body was added to.
   */
  onAdded(parent) {
    super.onAdded(parent);
    this.nextParent = parent;
  }

  /**
   * Called when body is removed from world.
   */
  onRemoved() {
    if (this.spawnTime) {
      this.startUpdates();
    } else {
      super.onRemoved();
    }
  }

  /**
   * Update the item.
   * @param  {Number} delta     The delta time.
   * @param  {Number} elapsedMS The elapsed time in milliseconds.
   */
  update(delta, elapsedMS) {
    this.timer += elapsedMS;

    if (
      !this.cell.bodies.some(b => b.blocking)
        && this.timer >= this.spawnTime
    ) {
      this.timer = 0;
      this.scale = 0;
      this.parent.add(this);
    }

    if (this.scale < 1) {
      this.scale += SCALE_INCREMENT * delta;

      if (this.scale >= 1) {
        this.scale = 1;

        this.stopUpdates();
      }
    }
  }

  /**
   * Set to the removed state.
   * @return {Boolean} state change successful.
   */
  setRemoved() {
    this.isRemoved = true;
  }
}

export default AbstractItem;
