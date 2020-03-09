import { Container } from 'game/core/graphics';
import HudContainer from './containers/HudContainer';

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

    this.addChild(new HudContainer(player, sprites.hud));
    this.addChild(sprites.weapon);
  }
}

export default PlayerContainer;
