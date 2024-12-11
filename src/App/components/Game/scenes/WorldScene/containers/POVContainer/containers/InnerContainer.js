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

    this.interactiveChildren = false;
  }

  update(particleChildren) {
    this.particleChildren = particleChildren;
    super.update();
  }

  destroy(options) {
    this.removeParticles(0, this.particleChildren.length);
    this.particleChildren = [];
    this.update();
    super.destroy(options);
  }
}
