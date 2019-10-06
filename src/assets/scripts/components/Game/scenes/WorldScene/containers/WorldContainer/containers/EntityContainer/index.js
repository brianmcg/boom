import { Container } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

class EntityContainer extends Container {
  constructor() {
    super(SCREEN.WIDTH * 2, {
      uvs: true,
      tint: true,
      vertices: true,
    });

    // this.sortableChildren = true;
  }

  // animate() {
  //   this.children.sort((a, b) => {
  //     return b.zIndex - a.zIndex;
  //   });
  //   // this.sortChildren();
  // }
}

export default EntityContainer;
