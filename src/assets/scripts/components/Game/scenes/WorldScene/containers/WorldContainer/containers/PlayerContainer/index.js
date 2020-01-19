import { Container } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';

const HUD_PADDING = SCREEN.HEIGHT / 16;

/**
 * Class representing an map container.
 */
class PlayerContainer extends Container {
  /**
   * Creates a PlayerContainer.
   * @param  {WeaponSprite} options.weapon The weapon sprite.
   */
  constructor(player, sprites) {
    super();

    const { weapon, hud } = sprites;
    const { health, ammo, foreground } = hud;

    health.icon.height = health.amount.height;
    health.icon.width = health.amount.height;
    health.icon.x = HUD_PADDING;
    health.icon.y = SCREEN.HEIGHT - health.icon.height - HUD_PADDING;
    health.amount.y = health.icon.y - 1.5;
    health.amount.x = health.icon.x + health.icon.width + (HUD_PADDING / 2);

    ammo.icon.height = ammo.amount.height;
    ammo.icon.width = ammo.amount.height;
    ammo.icon.x = SCREEN.WIDTH - ammo.icon.width - HUD_PADDING;
    ammo.icon.y = SCREEN.HEIGHT - ammo.icon.height - HUD_PADDING;
    ammo.amount.y = ammo.icon.y - 1.5;
    ammo.amount.x = ammo.icon.x - ammo.amount.width - (HUD_PADDING / 2);

    this.addChild(ammo.icon);
    this.addChild(ammo.amount);
    this.addChild(weapon);
    this.addChild(health.icon);
    this.addChild(health.amount);
    this.addChild(foreground);

    this.player = player;
    this.sprites = sprites;
  }

  update(delta) {
    const { hud, weapon } = this.sprites;
    const { ammo, health, foreground } = hud;

    health.amount.text = this.player.health;
    ammo.amount.text = this.player.weapon.ammo;
    ammo.amount.x = ammo.icon.x - ammo.amount.width - (HUD_PADDING / 2);
    foreground.alpha = 1 - this.player.vision;

    weapon.update(delta);
  }
}

export default PlayerContainer;
