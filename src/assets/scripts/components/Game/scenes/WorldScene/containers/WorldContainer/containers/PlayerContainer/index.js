import { Container } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';
import Player from '../../../../entities/Player';

const HUD_PADDING = SCREEN.HEIGHT / 16;

const ICON_PADDING = SCREEN.HEIGHT / 111;
/**
 * Class representing an map container.
 */
class PlayerContainer extends Container {
  /**
   * Creates a PlayerContainer.
   * @param  {Player} player  The player.
   * @param  {Object} sprites The container sprites.
   */
  constructor(player, sprites) {
    super();

    const { weapon, hud } = sprites;
    const {
      health,
      ammo,
      foreground,
      keys,
      message,
    } = hud;

    health.icon.height = health.amount.height;
    health.icon.width = health.amount.height;
    health.icon.x = HUD_PADDING;
    health.icon.y = SCREEN.HEIGHT - health.icon.height - HUD_PADDING;
    health.amount.y = health.icon.y - ICON_PADDING;
    health.amount.x = health.icon.x + health.icon.width + (HUD_PADDING / 2);

    ammo.icon.height = ammo.amount.height;
    ammo.icon.width = ammo.amount.height;
    ammo.icon.x = SCREEN.WIDTH - ammo.icon.width - HUD_PADDING;
    ammo.icon.y = SCREEN.HEIGHT - ammo.icon.height - HUD_PADDING;
    ammo.amount.y = ammo.icon.y - ICON_PADDING;
    ammo.amount.x = ammo.icon.x - ammo.amount.width - (HUD_PADDING / 2);

    message.y = HUD_PADDING;

    this.addChild(ammo.icon);
    this.addChild(ammo.amount);
    this.addChild(weapon);
    this.addChild(health.icon);
    this.addChild(health.amount);
    this.addChild(foreground);

    Object.values(keys).forEach((sprite, i) => {
      sprite.x = sprite.frameX + HUD_PADDING + ((ICON_PADDING + sprite.frameWidth) * i);
      sprite.y = sprite.frameY + HUD_PADDING;
      this.addChild(sprite);
    });

    this.player = player;
    this.sprites = sprites;

    player.on(Player.EVENTS.MESSAGE_ADDED, () => {
      this.addChild(message);
    });

    player.on(Player.EVENTS.MESSAGE_REMOVED, () => {
      if (!player.messages.length) {
        this.removeChild(message);
      }
    });
  }

  /**
   * Update the container.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    const { hud, weapon } = this.sprites;
    const {
      ammo,
      health,
      foreground,
      message,
    } = hud;

    const { messages } = this.player;

    // Update health.
    health.amount.text = this.player.health;

    // Update ammo.
    ammo.amount.text = this.player.weapon.ammo;
    ammo.amount.x = ammo.icon.x - ammo.amount.width - (HUD_PADDING / 2);

    // Update foreground.
    foreground.alpha = 1 - this.player.vision;

    // Update weapon.
    weapon.update(delta);

    // Update messages
    if (messages.length) {
      message.text = messages.map(m => m.text).join('\n');
      message.x = (SCREEN.WIDTH / 2) - (message.width / 2);
    }
  }

  /**
   * Stop the container.
   */
  stop() {
    super.stop();

    const { health, ammo } = this.sprites.hud;

    Object.values(health).forEach(sprite => sprite.hide());
    Object.values(ammo).forEach(sprite => sprite.hide());
  }

  /**
   * Play the container.
   */
  play() {
    super.play();

    const { health, ammo } = this.sprites.hud;

    Object.values(health).forEach(sprite => sprite.show());
    Object.values(ammo).forEach(sprite => sprite.show());
  }
}

export default PlayerContainer;
