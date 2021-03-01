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
  constructor(sprites) {
    super();

    sprites.forEach((layer) => {
      layer.forEach(slice => this.addChild(slice));
    });
  }

  /**
   * Sort the map container
   */
  update(delta) {
    this.children.sort((a, b) => b.zOrder - a.zOrder);
    super.update(delta);
  }
}

export default MapContainer;
