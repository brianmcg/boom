import { ParticleContainer } from '@game/core/graphics';
import { SCREEN } from '@game/constants/config';

/**
 * Class representing an inner background container.
 */
class InnerContainer extends ParticleContainer {
  /**
   * Creates an inner background container.
   * @param  {Array} sprites The background sprites.
   */
  constructor(sprites) {
    super(SCREEN.WIDTH * SCREEN.HEIGHT);

    sprites.forEach(slice => {
      slice.forEach(pixel => {
        this.addChild(pixel);
      });
    });
  }
}

export default InnerContainer;
