import { ParticleContainer } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

/**
 * Class representing a background container.
 */
class BackgroundContainer extends ParticleContainer {
  /**
   * Creates a background container.
   */
  constructor() {
    super(SCREEN.WIDTH * SCREEN.HEIGHT, {
      uvs: true,
      tint: true,
    });
  }
}

export default BackgroundContainer;
