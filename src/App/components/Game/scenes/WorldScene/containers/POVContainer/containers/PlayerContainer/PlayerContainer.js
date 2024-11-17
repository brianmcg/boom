import { Container } from '@game/core/graphics';
import { SCREEN } from '@constants/config';
import { GREY } from '@constants/colors';
import HUDContainer from './containers/HUDContainer';

const MAX_MOVE_X = SCREEN.WIDTH / 30;

/**
 * Class representing an map container.
 */
export default class PlayerContainer extends Container {
  /**
   * Creates a PlayerContainer.
   * @param  {Player} player  The player.
   * @param  {Object} sprites The player sprites.
   */
  constructor(player, sprites = {}) {
    super();

    const { weapon, hud } = sprites;

    this.hudContainer = new HUDContainer(player, hud);

    this.addChild(weapon);
    this.addChild(this.hudContainer);
    this.player = player;
    this.sprites = sprites;

    this.weaponCenterX = weapon.x;
    this.weaponCenterY = weapon.y;
    this.weaponHeight = weapon.height;

    player.onDying(() => this.removeHud());
  }

  /**
   * Update the container.
   * @param  {Number} delta The delta time.
   */
  update(ticker) {
    const { weapon } = this.sprites;
    const { hand, parent } = this.player;
    const { light, brightness } = parent;

    let intensity = brightness + light;

    if (intensity > 1) {
      intensity = 1;
    }

    if (intensity < 0) {
      intensity = 0;
    }

    weapon.x = this.weaponCenterX + hand.posX * MAX_MOVE_X;
    weapon.y = this.weaponCenterY + hand.posY * weapon.height;
    weapon.tint = Math.round(intensity * 255) * GREY;

    super.update(ticker);
  }

  /**
   * Remove the HUD container.
   */
  removeHud() {
    this.removeChild(this.hudContainer);
  }

  /**
   * Destroy the container.
   * @param  {Object} options The destroy options.
   */
  destroy(options) {
    const { weapon } = this.sprites;

    weapon.removeAllListeners();
    this.removeChild(weapon);
    weapon.destroy();

    this.removeChild(this.hudContainer);
    this.hudContainer.destroy(options);

    super.destroy(options);
  }
}
