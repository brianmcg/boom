import { ParticleContainer } from '@game/core/graphics';

export default class InnerContainer extends ParticleContainer {
  constructor() {
    super({
      dynamicProperties: {
        vertex: false,
        position: false,
        rotation: false,
        uvs: true,
        color: false,
      },
    });
  }
}
