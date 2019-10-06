import { Container } from '~/core/graphics';

/**
 * Class representing an entity container.
 */
class EntityContainer extends Container {
  /**
   * Creates an entity container.
   */
  constructor() {
    super();
    this.hideable = [];
  }

  /**
   * Animate the entity container
   */
  animate() {
    this.children.sort((a, b) => b.zOrder - a.zOrder);
  }

  /**
   * Reset the entity container.
   */
  reset() {
    this.hideable.forEach((child) => {
      child.visible = false;
    });
  }

  addChild(child) {
    if (child.hideOnAnimate) {
      this.hideable.push(child);
    }

    super.addChild(child);
  }

  removeChild(child) {
    if (child.hideOnAnimate) {
      this.hideable = this.hideable.filter(h => h !== child);
    }

    super.removeChild(child);
  }

  removeChildren() {
    this.hideable = [];
    super.removeChildren();
  }
}

export default EntityContainer;


// constructor() {
//   super(SCREEN.WIDTH * 2, {
//     uvs: true,
//     tint: true,
//     vertices: true,
//   });

//   // this.sortableChildren = true;
// }
