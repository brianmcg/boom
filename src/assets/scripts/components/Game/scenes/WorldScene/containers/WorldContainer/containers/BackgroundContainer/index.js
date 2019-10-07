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

    this.background = background;

    background.forEach((row, i) => {
      row.forEach((pixel, y) => {
        pixel.x = i;
        pixel.y = y;
        this.addChild(pixel);
      });
    });
  }
}

export default BackgroundContainer;
