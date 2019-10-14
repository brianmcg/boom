import { Container } from '~/core/graphics';

/**
 * Class representing an map container.
 */
class MapContainer extends Container {
  /**
   * Creates an map container.
   */
  constructor({ walls, entities }) {
    super();
    this.hideable = [];
    this.walls = walls;
    this.entities = entities;

    walls.forEach((wall, i) => {
      wall.x = i;
      this.addChild(wall);
    });

    Object.values(entities).forEach((entity) => {
      this.addChild(entity);
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
