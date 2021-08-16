import { Container } from 'game/core/graphics';

/**
 * Class representing an outer background container.
 */
class InnerContainer extends Container {
  /**
   * Creates an outer background container.
   * @param  {Array} sprites The background sprites.
   */
  constructor(sprites) {
    super();
    Object.values(sprites).forEach(sprite => this.addChild(sprite));
  }
}

export default InnerContainer;
