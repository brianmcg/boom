import { Container } from 'game/core/graphics';

/**
 * Class representing an map container.
 */
class PlayerContainer extends Container {
  /**
   * Creates a PlayerContainer.
   * @param  {WeaponSprite} options.weapon The weapon sprite.
   */
  constructor({ weapon }) {
    super();

    this.addChild(weapon);
  }
}

export default PlayerContainer;
