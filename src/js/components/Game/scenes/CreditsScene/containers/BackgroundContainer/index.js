import { Container } from '@game/core/graphics';
import { SCREEN } from '@game/constants/config';

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

    const ratio = SCREEN.HEIGHT / smoke.height;
    smoke.width *= ratio;
    smoke.height *= ratio;

    smoke.x = (SCREEN.WIDTH - smoke.width) / 2;
    this.addChild(smoke);
  }
}

export default BackgroundContainer;
