import { Container } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';

const HUD_PADDING = SCREEN.HEIGHT / 24;

const ICON_PADDING = SCREEN.HEIGHT / 111;

class HudContainer extends Container {
  constructor(player, sprites) {
    super();

    const {
      healthIcon,
      healthAmount,
      ammoIcon,
      ammoAmount,
      foreground,
      keys,
      message,
    } = sprites;

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
    this.addChild(healthIcon);
    this.addChild(healthAmount);
    this.addChild(foreground);

    keys.forEach((sprite, i) => {
      sprite.x = HUD_PADDING + (sprite.width / 2) + ((ICON_PADDING + sprite.width) * i) - 1;
      sprite.y = HUD_PADDING + (sprite.height / 2) - 1;
      this.addChild(sprite);
    });

    this.player = player;
    this.sprites = sprites;

    player.onMessageAddedEvent(() => this.addChild(message));

    player.onMessageRemovedEvent(() => !player.hasMessages() && this.removeChild(message));
  }

  /**
   * Update the container.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    const {
      healthAmount,
      ammoIcon,
      ammoAmount,
      foreground,
      message,
      keys,
    } = this.sprites;

    const { messages } = this.player;

    Object.values(keys).forEach((key) => {
      if (!key.isInactive()) {
        key.update(delta);
      }
    });

    // Update health.
    healthAmount.text = this.player.health;

    // Update ammo.
    ammoAmount.text = this.player.weapon.ammo;
    ammoAmount.x = ammoIcon.x - ammoAmount.width - (HUD_PADDING / 2);

    // Update foreground.
    foreground.alpha = 1 - this.player.vision;

    // Update messages
    if (messages.length) {
      message.text = messages.map(m => m.text).join('\n');
      message.x = (SCREEN.WIDTH / 2) - (message.width / 2);
    }
  }

  /**
   * Play the container.
   */
  play() {
    super.play();
    this.show();
  }

  /**
   * Stop the container.
   */
  stop() {
    super.stop();
    this.hide();
  }
}

export default HudContainer;
