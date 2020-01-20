import { Container } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';

/**
 * Class representing a foreground container.
 */
class ForegroundContainer extends Container {
  /**
   * Creates a foreground container.
   * @param  {LogoSprite}         options.logo   The logo sprite.
   */
  constructor({ logo }) {
    const ratio = logo.height / (SCREEN.HEIGHT / 1.5);

    super();

    logo.height /= ratio;
    logo.width /= ratio;
    logo.x = (SCREEN.WIDTH / 2) - (logo.width / 2);
    logo.y = (SCREEN.HEIGHT / 2) - (logo.height / 2);

    this.addChild(logo);
  }
}

export default ForegroundContainer;
