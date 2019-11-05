import { ParticleContainer } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

/**
 * Class representing a background container.
 */
class BackgroundContainer extends ParticleContainer {
  /**
   * Creates a background container.
   */
  constructor(background) {
    super(SCREEN.WIDTH * SCREEN.HEIGHT, {
      uvs: true,
      tint: true,
    });

    background.forEach((slice) => {
      slice.forEach((pixel) => {
        this.addChild(pixel);
      });
    });

    this.background = background;
  }
}

export default BackgroundContainer;
