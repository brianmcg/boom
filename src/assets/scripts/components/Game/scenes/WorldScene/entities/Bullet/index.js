import { CELL_SIZE } from 'game/constants/config';
import { Body } from 'game/core/physics';

/**
 * Class representing a bullet.
 */
class Bullet extends Body {
  /**
   * Creates a bullet.
   * @extends {Body}
   * @param  {[type]} options.explosionType The explosion type.
   */
  constructor({ explosionType }) {
    super({
      width: CELL_SIZE / 8,
      length: CELL_SIZE / 8,
      height: CELL_SIZE / 8,
    });

    this.explosionType = explosionType;
  }
}

export default Bullet;
