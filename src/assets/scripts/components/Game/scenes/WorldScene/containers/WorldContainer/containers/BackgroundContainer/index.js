import { ParticleContainer } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

class BackgroundContainer extends ParticleContainer {
  constructor() {
    super(SCREEN.WIDTH * SCREEN.HEIGHT, {
      uvs: true,
      tint: true,
    });
  }
}

export default BackgroundContainer;
