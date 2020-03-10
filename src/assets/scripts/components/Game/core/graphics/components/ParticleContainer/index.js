import { ParticleContainer as PixiParticleContainer } from 'pixi.js';

/**
 * @class ParticleContainer
 */
class ParticleContainer extends PixiParticleContainer {
	/**
   * Creates a particle container.
   * @param  {Number} maxSize	The max batch size.
   */
 	constructor(maxSize) {
 		super(maxSize, {
      uvs: true,
      tint: true,
    });
 	}
}

export default ParticleContainer;
