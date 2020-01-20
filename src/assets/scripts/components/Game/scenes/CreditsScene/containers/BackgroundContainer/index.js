import { Container } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';

/**
 * Class representing a background container.
 */
class BackgroundContainer extends Container {
  /**
   * Creates a background container.
   * @param  {AnimatedSprite} options.smoke The smoke sprite.
   */
  constructor({ smoke }) {
    super();
    smoke.width = SCREEN.WIDTH;
    smoke.height = SCREEN.HEIGHT;
    this.addChild(smoke);
  }
}

export default BackgroundContainer;
