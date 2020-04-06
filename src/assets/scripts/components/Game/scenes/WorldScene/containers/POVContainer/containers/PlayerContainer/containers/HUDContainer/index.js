import { Container } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';

const HUD_PADDING = SCREEN.HEIGHT / 24;

const ICON_PADDING = SCREEN.HEIGHT / 111;

/**
 * Class representing a hud container.
 */
class HUDContainer extends Container {
  /**
   * Creates a hud container.
   * @param  {Player} player  The player.
   * @param  {Object} sprites The hud sprites.
   */
  constructor(player, sprites) {
    super();

    const {
      healthIcon,
      healthAmount,
      ammoIcon,
      ammoAmount,
      foreground,
      keys,
      messages,
    } = sprites;

    healthIcon.x = HUD_PADDING + (healthIcon.width / 2);
    healthIcon.y = SCREEN.HEIGHT - (healthIcon.height / 2) - HUD_PADDING;
    healthAmount.x = healthIcon.x + (healthIcon.width / 2)
      + (healthAmount.width / 2) + (HUD_PADDING / 2);
    healthAmount.y = healthIcon.y;

    ammoIcon.x = SCREEN.WIDTH - (ammoIcon.width / 2) - HUD_PADDING;
    ammoIcon.y = SCREEN.HEIGHT - (ammoIcon.height / 2) - HUD_PADDING;
    ammoAmount.x = ammoIcon.x - (ammoIcon.width / 2) - (ammoAmount.width / 2) - (HUD_PADDING / 2);
    ammoAmount.y = ammoIcon.y;

    this.addChild(ammoIcon);
    this.addChild(ammoAmount);
    this.addChild(healthIcon);
    this.addChild(healthAmount);
    this.addChild(foreground);

    Object.values(player.keyCards).forEach((keyCard) => {
      keyCard.onUseEvent(() => {
        keys[keyCard.color].setUsing();
      });

      keyCard.onEquipEvent(() => {
        const sprite = keys[keyCard.color];
        const index = Object.values(player.keyCards).filter(k => k.equiped).length - 1;
        sprite.x = HUD_PADDING + (sprite.width / 2) + ((ICON_PADDING + sprite.width) * index) - 1;
        sprite.y = HUD_PADDING + (sprite.height / 2) - 1;
        sprite.setEquipping();
        this.addChild(sprite);
      });
    });

    messages.forEach((message) => {
      message.x = SCREEN.WIDTH / 2;
    });

    player.onMessagesUpdatedEvent((items) => {
      messages.forEach((message, i) => {
        const item = items[i];

        if (item) {
          message.text = item.text;
          message.y = HUD_PADDING + (message.height / 2)
            + ((message.height + (HUD_PADDING / 2)) * i);
          this.addChild(message);
        } else {
          this.removeChild(message);
        }
      });
    });

    this.player = player;
    this.sprites = sprites;
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
      keys,
    } = this.sprites;

    Object.values(keys).forEach((key) => {
      if (!key.isInactive()) {
        key.update(delta);
      }
    });

    // Update health.
    healthAmount.text = this.player.health;

    // Update ammo.
    ammoAmount.text = this.player.weapon.ammo;
    ammoAmount.x = ammoIcon.x - (ammoIcon.width / 2) - (ammoAmount.width / 2) - (HUD_PADDING / 2);

    // Update foreground.
    foreground.alpha = 1 - this.player.vision;
  }
}

export default HUDContainer;
