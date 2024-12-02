import { Container } from '@game/core/graphics';
import { SCREEN } from '@constants/config';
import MessageSprite from './sprites/MessageSprite';

const HUD_PADDING = SCREEN.HEIGHT / 24;

const ICON_PADDING = SCREEN.HEIGHT / 111;

const MESSAGE_PADDING = 3;

const displayHealth = ({ health, maxHealth }) =>
  Math.round((health / maxHealth) * 100);

const displayAmmo = ({ weapon }) =>
  Number.isNaN(Number(weapon?.ammo)) ? '-' : weapon.ammo;

export default class HUDContainer extends Container {
  constructor(player, sprites) {
    super();

    const { healthIcon, healthAmount, ammoIcon, ammoAmount, keys } = sprites;

    healthIcon.x = healthIcon.width / 2 + HUD_PADDING;
    healthIcon.y = SCREEN.HEIGHT - healthIcon.height / 2 - HUD_PADDING;

    healthAmount.text = displayHealth(player);
    ammoAmount.text = displayAmmo(player);

    healthAmount.x =
      healthIcon.x +
      healthIcon.width / 2 +
      healthAmount.width / 2 +
      HUD_PADDING / 2;
    healthAmount.y = healthIcon.y;

    ammoIcon.x = SCREEN.WIDTH - ammoIcon.width / 2 - HUD_PADDING;
    ammoIcon.y = SCREEN.HEIGHT - ammoIcon.height / 2 - HUD_PADDING;

    ammoAmount.x = ammoIcon.x - ammoIcon.width / 2 - HUD_PADDING / 2;
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
        const index =
          Object.values(player.keyCards).filter(k => k.equiped).length - 1;
        sprite.x =
          HUD_PADDING +
          sprite.width / 2 +
          (ICON_PADDING + sprite.width) * index -
          1;
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

  update(ticker) {
    const { keys, foreground } = this.sprites;

    // Update each key card sprite if it is active.
    Object.values(keys).forEach(key => {
      if (!key.isInactive()) {
        key.update(ticker);
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

    this.messages.forEach(message => message.update(ticker));

    // Update foreground.
    if (this.player.vision) {
      foreground.alpha = 1 - this.player.vision;
      this.addChild(foreground);
    } else {
      this.removeChild(foreground);
    }
  }

  updateHealth() {
    this.sprites.healthAmount.text = displayHealth(this.player);
  }

  updateAmmo() {
    const { weapon } = this.player;

    if (weapon && !weapon.secondary) {
      const { ammoIcon, ammoAmount } = this.sprites;

      ammoAmount.text = displayAmmo(this.player);
      ammoAmount.x =
        ammoIcon.x -
        ammoIcon.width / 2 -
        ammoAmount.width / 2 -
        HUD_PADDING / 2;
    }
  }

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
