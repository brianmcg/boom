import { Container } from '~/core/graphics';

/**
 * Class representing an map container.
 */
class PlayerContainer extends Container {
  /**
   * Creates an map container.
   */
  constructor({ weapon }) {
    super();

    this.weapon = weapon;

    this.addChild(weapon);
  }
}

export default PlayerContainer;
