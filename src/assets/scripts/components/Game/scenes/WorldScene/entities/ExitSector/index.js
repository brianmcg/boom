import { TIME_STEP } from '~/constants/config';
import SwitchSector from '../SwitchSector';

const INTERVAL = 1000;

/**
 * Class representing an exit sector.
 * @extends {SwitchSector}
 */
class ExitSector extends SwitchSector {
  /**
   * Creates an exit sector.
   * @param  {Number} options.x       The x coordinate of the sector.
   * @param  {Number} options.y       The y coordinate of the sector
   * @param  {Number} options.width   The width of the sector.
   * @param  {Number} options.length  The length of the sector.
   * @param  {Number} options.height  The height of the sector.
   * @param  {Object} options.sides   The ids of the sides of the sector.
   */
  constructor(options) {
    super(options);
    this.timer = 0;
  }

  /**
   * Update the exit sector.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    if (this.enabled) {
      this.timer += TIME_STEP * delta;

      if (this.timer >= INTERVAL) {
        this.timer = 0;
        console.log('foobar');
        this.world.exit();
      }
    }
  }
}

export default ExitSector;
