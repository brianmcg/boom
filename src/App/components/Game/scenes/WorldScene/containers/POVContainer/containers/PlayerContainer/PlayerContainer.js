import { Container } from '@game/core/graphics';
import { SCREEN } from '@constants/config';
import { LIGHT_GREY } from '@constants/colors';
import HUDContainer from './containers/HUDContainer';

const MAX_MOVE_X = SCREEN.WIDTH / 30;

export default class PlayerContainer extends Container {
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
    weapon.tint = Math.round(intensity * 255) * LIGHT_GREY;

    super.update(ticker);
  }

  removeHud() {
    this.removeChild(this.hudContainer);
  }

  destroy(options) {
    this.sprites.weapon.destroy(options);
    this.hudContainer.destroy(options);
    super.destroy(options);
    this.sprites = null;
  }
}
