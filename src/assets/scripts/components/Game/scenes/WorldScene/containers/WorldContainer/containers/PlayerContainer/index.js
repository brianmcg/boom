import { Container } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';
import Player from '../../../../entities/Player';

const HUD_PADDING = SCREEN.HEIGHT / 24;

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
      healthIcon,
      healthAmount,
      ammoIcon,
      ammoAmount,
      foreground,
      keys,
      message,
    } = hud;

    healthIcon.height = healthAmount.height;
    healthIcon.width = healthAmount.height;
    healthIcon.x = HUD_PADDING;
    healthIcon.y = SCREEN.HEIGHT - healthIcon.height - HUD_PADDING;
    healthAmount.y = healthIcon.y - ICON_PADDING;
    healthAmount.x = healthIcon.x + healthIcon.width + (HUD_PADDING / 2);

    ammoIcon.height = ammoAmount.height;
    ammoIcon.width = ammoAmount.height;
    ammoIcon.x = SCREEN.WIDTH - ammoIcon.width - HUD_PADDING;
    ammoIcon.y = SCREEN.HEIGHT - ammoIcon.height - HUD_PADDING;
    ammoAmount.y = ammoIcon.y - ICON_PADDING;
    ammoAmount.x = ammoIcon.x - ammoAmount.width - (HUD_PADDING / 2);

    message.y = HUD_PADDING;

    this.addChild(ammoIcon);
    this.addChild(ammoAmount);
    this.addChild(weapon);
    this.addChild(healthIcon);
    this.addChild(healthAmount);
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
      healthAmount,
      ammoIcon,
      ammoAmount,
      foreground,
      message,
    } = hud;

    const { messages } = this.player;

    // Update health.
    healthAmount.text = this.player.health;

    // Update ammo.
    ammoAmount.text = this.player.weapon.ammo;
    ammoAmount.x = ammoIcon.x - ammoAmount.width - (HUD_PADDING / 2);

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
    this.hide();
  }

  /**
   * Play the container.
   */
  play() {
    super.play();
    this.show();
  }
}

export default PlayerContainer;
