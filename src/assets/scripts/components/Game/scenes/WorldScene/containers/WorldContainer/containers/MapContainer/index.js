import { Container } from 'game/core/graphics';

/**
 * Class representing an map container.
 */
class MapContainer extends Container {
  /**
   * Creates a MapContainer.
   * @param  {Array}  options.walls    The wall sprites.
   * @param  {Object} options.entities The entity sprites.
   */
  constructor({ walls, entities, effects }) {
    super();

    this.walls = walls;
    this.entities = entities;
    this.effects = effects;
    this.dynamicChildren = Object.values(entities);
    this.walls.forEach(wall => this.addChild(wall));
  }

  /**
   * Sort the map container
   */
  sort() {
    this.children.sort((a, b) => b.zOrder - a.zOrder);
  }

  /**
   * Reset the map container.
   */
  reset() {
    this.dynamicChildren.forEach(child => this.removeChild(child));
  }
}

export default MapContainer;
