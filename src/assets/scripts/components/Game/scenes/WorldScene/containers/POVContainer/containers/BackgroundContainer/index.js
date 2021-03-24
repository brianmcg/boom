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
  constructor({ inner, outer }) {
    super(SCREEN.WIDTH * SCREEN.HEIGHT);

    Object.values(outer).forEach(sprite => this.addChild(sprite));

    inner.forEach((slice) => {
      slice.forEach((pixel) => {
        this.addChild(pixel);
      });
    });
  }
}

export default BackgroundContainer;
