import { ParticleContainer } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

class EntityContainer extends ParticleContainer {
  constructor() {
    super(SCREEN.WIDTH * 2, {
      uvs: true,
      tint: true,
      vertices: true,
    });

    this.sortableChildren = true;
  }

  animate() {
    this.sortChildren();
  }
}

export default EntityContainer;
