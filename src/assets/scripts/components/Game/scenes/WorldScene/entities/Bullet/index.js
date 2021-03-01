import { CELL_SIZE } from 'game/constants/config';
import { Body } from 'game/core/physics';

/**
 * Class representing a hitScan.
 */
class Bullet extends Body {
  /**
   * Creates a hitScan.
   * @extends {Body}
   * @param  {[type]} options.explosionType The explosion type.
   */
  constructor({ explosionType }) {
    super({
      width: CELL_SIZE / 8,
      height: CELL_SIZE / 8,
    });

    this.explosionType = explosionType;
  }
}

export default Bullet;
