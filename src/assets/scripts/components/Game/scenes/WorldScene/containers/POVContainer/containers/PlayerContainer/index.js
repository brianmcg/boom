import { Container } from 'game/core/graphics';
import HUDContainer from './containers/HUDContainer';

/**
 * Class representing an map container.
 */
class PlayerContainer extends Container {
  /**
   * Creates a PlayerContainer.
   * @param  {Player} player  The player.
   * @param  {Object} sprites The player sprites.
   */
  constructor(player, sprites = {}) {
    super();

    this.addChild(sprites.weapon);
    this.addChild(new HUDContainer(player, sprites.hud));
  }
}

export default PlayerContainer;
