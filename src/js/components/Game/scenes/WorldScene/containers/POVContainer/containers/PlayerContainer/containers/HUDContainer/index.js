import { Container } from '@game/core/graphics';
import { SCREEN } from '@game/constants/config';
import MessageSprite from './sprites/MessageSprite';

const HUD_PADDING = SCREEN.HEIGHT / 24;

const ICON_PADDING = SCREEN.HEIGHT / 111;

const MESSAGE_PADDING = 3;

const displayHealth = ({ health, maxHealth }) => Math.round((health / maxHealth) * 100);

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

    const { healthIcon, healthAmount, ammoIcon, ammoAmount, keys } = sprites;

    healthIcon.x = HUD_PADDING + healthIcon.width / 2;
    healthIcon.y = SCREEN.HEIGHT - healthIcon.height / 2 - HUD_PADDING;
    healthAmount.text = displayHealth(player);
    healthAmount.x = healthIcon.x + healthIcon.width / 2 + healthAmount.width / 2 + HUD_PADDING / 2;
    healthAmount.y = healthIcon.y;

    ammoIcon.x = SCREEN.WIDTH - ammoIcon.width / 2 - HUD_PADDING;
    ammoIcon.y = SCREEN.HEIGHT - ammoIcon.height / 2 - HUD_PADDING;
    ammoAmount.x = ammoIcon.x - ammoIcon.width / 2 - ammoAmount.width / 2 - HUD_PADDING / 2;
    ammoAmount.y = ammoIcon.y;

    this.addChild(ammoIcon);
    this.addChild(ammoAmount);
    this.addChild(healthIcon);
    this.addChild(healthAmount);

    // Set key card sprite positions
    Object.values(player.keyCards).forEach(keyCard => {
      keyCard.onUseEvent(() => {
        keys[keyCard.color].setUsing();
      });

      keyCard.onEquipEvent(() => {
        const sprite = keys[keyCard.color];
        const index = Object.values(player.keyCards).filter(k => k.equiped).length - 1;
        sprite.x = HUD_PADDING + sprite.width / 2 + (ICON_PADDING + sprite.width) * index - 1;
        sprite.y = HUD_PADDING + sprite.height / 2 - 1;
        sprite.setEquipping();
        this.addChild(sprite);
      });
    });

    this.messages = [];

    player.onMessageAdded((text, options) => {
      const sprite = new MessageSprite(text, options);

      this.messages.push(sprite);

      sprite.onComplete(() => {
        this.messages = this.messages.filter(message => message !== sprite);
        this.removeChild(sprite);
        sprite.destroy();
      });

      this.addChild(sprite);
    });

    // Update hud on pick up event.
    player.onPickUp(({ isAmmo, isHealth }) => {
      if (isAmmo) this.updateAmmo();
      if (isHealth) this.updateHealth();
    });

    // Update health sprite on player hurt event.
    player.onHurt(() => this.updateHealth());

    // Update ammo sprites on fore weapon event.
    player.onUseWeapon(() => this.updateAmmo());

    // Update ammo sprites on change weapon event.
    player.onArmWeapon(() => this.updateAmmo());

    this.player = player;
    this.sprites = sprites;
  }

  /**
   * Update the container.
   * @param  {Number} delta The delta time.
   */
  update(delta, elapsedMS) {
    const { keys, foreground } = this.sprites;

    // Update each key card sprite if it is active.
    Object.values(keys).forEach(key => {
      if (!key.isInactive()) {
        key.update(delta);
      }
    });

    // Update messages.
    this.messages.forEach((message, i) => {
      let y = HUD_PADDING + this.messages[0].height / 2;

      for (let j = 0; j < i; j++) {
        y += this.messages[j].height + MESSAGE_PADDING;
      }

      message.y = y;
    });

    this.messages.forEach(message => message.update(delta, elapsedMS));

    // Update foreground.
    if (this.player.vision) {
      foreground.alpha = 1 - this.player.vision;
      this.addChild(foreground);
    } else {
      this.removeChild(foreground);
    }
  }

  /**
   * Update the ammo amount text.
   */
  updateHealth() {
    this.sprites.healthAmount.text = displayHealth(this.player);
  }

  /**
   * Update the health amount text.
   */
  updateAmmo() {
    const { weapon } = this.player;

    if (weapon && !weapon.secondary) {
      const { ammoIcon, ammoAmount } = this.sprites;

      ammoAmount.text = Number.isNaN(Number(weapon?.ammo)) ? '-' : weapon.ammo;
      ammoAmount.x = ammoIcon.x - ammoIcon.width / 2 - ammoAmount.width / 2 - HUD_PADDING / 2;
    }
  }

  /**
   * Destroy the container.
   * @param  {Object} options The destroy options.
   */
  destroy(options) {
    const { keys } = this.sprites;

    Object.values(keys).forEach(sprite => {
      sprite.removeAllListeners?.();
      this.removeChild(sprite);
      sprite.destroy(options);
    });

    super.destroy(options);
  }
}

export default HUDContainer;
