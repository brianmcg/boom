import { Container } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

/**
 * Class representing a background container.
 */
export default class BackgroundContainer extends Container {
  /**
   * Creates a background container.
   * @param  {Object} options.smoke The smoke sprite.
   */
  constructor({ smoke }) {
    super();
    smoke.width = SCREEN.WIDTH;
    smoke.height = SCREEN.HEIGHT;
    this.addChild(smoke);
  }
}
