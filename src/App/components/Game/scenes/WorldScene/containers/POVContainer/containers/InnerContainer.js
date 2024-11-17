import { ParticleContainer } from '@game/core/graphics';
// import { Texture } from 'pixi.js';
/**
 * Class representing an inner background container.
 */
export default class InnerContainer extends ParticleContainer {
  /**
   * Creates an inner background container.
   */
  constructor() {
    super({
      dynamicProperties: {
        vertex: false,
        position: false,
        rotation: false,
        uvs: true,
        color: true,
      },
    });
  }
}
