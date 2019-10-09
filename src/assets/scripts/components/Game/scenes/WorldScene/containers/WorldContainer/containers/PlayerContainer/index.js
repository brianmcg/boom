import { Container } from '~/core/graphics';
import { SCREEN, TILE_SIZE } from '~/constants/config';
/**
 * Class representing an map container.
 */
class PlayerContainer extends Container {
  /**
   * Creates an map container.
   */
  constructor({ weapon }) {
    super();


    weapon.scale = {
      x: 2,
      y: 2,
    };

    this.x = (SCREEN.WIDTH / 2) - TILE_SIZE;

    this.addChild(weapon);
    // weapon.gotoAndStop();
  }
}

export default PlayerContainer;
