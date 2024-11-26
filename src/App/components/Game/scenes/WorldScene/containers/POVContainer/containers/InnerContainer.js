import { ParticleContainer } from '@game/core/graphics';

export default class InnerContainer extends ParticleContainer {
  constructor() {
    super({
      roundPixels: true,
      dynamicProperties: {
        vertex: false,
        position: false,
        rotation: false,
        uvs: true,
        color: false,
      },
    });
  }

  update(particles) {
    this.particleChildren = particles;
    super.update();
  }
}
