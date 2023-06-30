import { Container } from '@game/core/graphics';
import { SCREEN } from '@game/constants/config';

/**
 * Class representing a foreground container.
 */
class ForegroundContainer extends Container {
  /**
   * Creates a foreground container.
   * @param  {LogoSprite}         options.logo   The logo sprite.
   */
  constructor({ logo }) {
    super();

    logo.x = (SCREEN.WIDTH / 2);
    logo.y = (SCREEN.HEIGHT / 2);

    this.addChild(logo);
  }
}

export default ForegroundContainer;
