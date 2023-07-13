import { AnimatedSprite } from '@game/core/graphics';
import { SCREEN } from '@game/constants/config';

const SCALE_RATIO = SCREEN.HEIGHT / 160;

/**
 * Class representing a weapon sprite.
 */
class WeaponSprite extends AnimatedSprite {
  /**
   * Creates a weapon sprite.
   * @param  {Object} textureCollection A hashmap containing the textures.
   * @param  {Player} player            The player.
   */
  constructor(textureCollection, player) {
    super(textureCollection[player.weapons[0].name].idle, {
      animationSpeed: 0.3,
      loop: false,
    });

    this.textureCollection = textureCollection;

    this.player = player;

    this.x = SCREEN.WIDTH / 2;
    this.y = SCREEN.HEIGHT;

    Object.values(player.weapons).forEach(weapon => {
      weapon.onUse(() => this.setUsing());
      // Immediately stop animation for automatic weapon.
      if (weapon.automatic) {
        weapon.onStop(() => this.setIdle());
      }
    });

    this.onComplete = () => {
      // this.gotoAndStop(0);
      if (player.weapon) {
        this.setIdle();

        if (player.weapon.secondary) {
          player.selectWeapon(player.previousWeaponIndex, {
            silent: true,
          });
        }
      }
    };

    this.setIdle();
  }

  /**
   * Set the idle animation.
   */
  setIdle() {
    this.gotoAndStop(0);

    const { weapon } = this.player;

    if (weapon) {
      this.textures = this.textureCollection[weapon.name].idle;
      this.anchor.set(weapon.anchorX, weapon.anchorY);
      this.scale.set(weapon.scale * SCALE_RATIO);
    }
  }

  /**
   * Set the using animation.
   */
  setUsing() {
    const { name, automatic } = this.player.weapon;

    if ((automatic && !this.playing) || !automatic) {
      this.textures = this.textureCollection[name].firing;
      this.loop = automatic;
      this.gotoAndPlay(0);
    }
  }
}

export default WeaponSprite;
