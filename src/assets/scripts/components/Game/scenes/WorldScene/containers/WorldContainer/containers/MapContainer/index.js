import { Container } from '~/core/graphics';

/**
 * Class representing an map container.
 */
class MapContainer extends Container {
  /**
   * Creates an map container.
   */
  constructor({ walls, objects }) {
    super();
    this.hideable = [];
    this.walls = walls;
    this.objects = objects;

    walls.forEach((wall, i) => {
      wall.x = i;
      this.addChild(wall);
    });

    Object.values(objects).forEach((object) => {
      this.addChild(object);
    });
  }

  /**
   * Sorts the map container
   */
  sort() {
    this.children.sort((a, b) => b.zOrder - a.zOrder);
  }

  /**
   * Reset the map container.
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

export default MapContainer;


// constructor() {
//   super(SCREEN.WIDTH * 2, {
//     uvs: true,
//     tint: true,
//     vertices: true,
//   });

//   // this.sortableChildren = true;
// }
