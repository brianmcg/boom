import { ParticleContainer } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';

/**
 * Class representing a background container.
 */
class BackgroundContainer extends ParticleContainer {
  /**
   * Creates a background container.
   * @param  {Array} background The background sprites.
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
