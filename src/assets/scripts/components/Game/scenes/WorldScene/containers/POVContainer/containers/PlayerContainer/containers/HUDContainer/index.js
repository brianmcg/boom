import { Container } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';
import MessageSprite from './sprites/MessageSprite';

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

    // Set key card sprite positions
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

    this.messages = [];

    player.onMessageAdded((message) => {
      const sprite = new MessageSprite(message);

      this.messages.push(sprite);

      sprite.onComplete(() => {
        this.messages = this.messages.filter(m => m !== sprite);
        this.removeChild(sprite);
        sprite.destroy();
      });

      this.addChild(sprite);
    });

    // Update hud on pick up event.
    player.onPickUp(() => {
      ammoAmount.text = this.player.weapon.ammo;
      ammoAmount.x = ammoIcon.x - (ammoIcon.width / 2) - (ammoAmount.width / 2) - (HUD_PADDING / 2);
      healthAmount.text = this.player.health;
    });

    // Update health sprite on player hurt event.
    player.onHurt(() => {
      healthAmount.text = this.player.health;
    });

    // Update ammo sprites on fore weapon event.
    player.onFireWeapon(() => {
      ammoAmount.text = this.player.weapon.ammo;
      ammoAmount.x = ammoIcon.x - (ammoIcon.width / 2) - (ammoAmount.width / 2) - (HUD_PADDING / 2);
    });

    // Update ammo sprites on change weapon event.
    player.onChangeWeapon(() => {
      ammoAmount.text = this.player.weapon.ammo;
      ammoAmount.x = ammoIcon.x - (ammoIcon.width / 2) - (ammoAmount.width / 2) - (HUD_PADDING / 2);
    });

    this.player = player;
    this.sprites = sprites;
  }

  /**
   * Update the container.
   * @param  {Number} delta The delta time.
   */
  update(delta, elapsedMS) {
    const { foreground, keys } = this.sprites;

    // Update each key card sprite if it is active.
    Object.values(keys).forEach((key) => {
      if (!key.isInactive()) {
        key.update(delta);
      }
    });

    // Update messages.
    this.messages.forEach((message, i) => {
      let y = HUD_PADDING;

      for (let j = 0; j < i; j += 1) {
        y += this.messages[j].height + 4;
      }

      message.y = y;
    });

    // Update foreground.
    foreground.alpha = 1 - this.player.vision;

    super.update(delta, elapsedMS);
  }
}

export default HUDContainer;
