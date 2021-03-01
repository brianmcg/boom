import { ParticleContainer } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';

/**
 * Class representing a background container.
 */
class BackgroundContainer extends ParticleContainer {
  /**
   * Creates a background container.
   * @param  {Array} sprites The background sprites.
   */
  constructor(sprites) {
    super(SCREEN.WIDTH * SCREEN.HEIGHT);

    sprites.forEach((slice) => {
      slice.forEach((pixel) => {
        this.addChild(pixel);
      });
    });
  }
}

export default BackgroundContainer;
