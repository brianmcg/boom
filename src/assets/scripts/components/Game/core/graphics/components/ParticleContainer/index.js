import { ParticleContainer as PixiParticleContainer } from '@pixi/particle-container';

/**
 * @class ParticleContainer
 */
class ParticleContainer extends PixiParticleContainer {
  /**
   * Creates a particle container.
   * @param  {Number} maxSize The max batch size.
   */
  constructor(maxSize) {
    super(maxSize, {
      uvs: true,
      tint: true,
      position: false,
    });
  }
}

export default ParticleContainer;
