import { AnimatedSprite } from '@game/core/graphics';
import { SCREEN } from '@game/constants/config';

const SCALE_RATIO = SCREEN.HEIGHT / 180;

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
      animationSpeed: 0.25,
      loop: false,
    });

    this.textureCollection = textureCollection;

    this.player = player;

    this.x = SCREEN.WIDTH / 2;
    this.y = SCREEN.HEIGHT;

    player.onUseWeapon(() => {
      this.fire();
    });

    player.onUnarmWeapon(() => {
      this.reset();
    });

    player.onArmWeapon(() => {
      this.reset();
    });

    player.onReleaseWeapon(() => {
      this.loop = false;
    });

    this.onComplete = () => {
      this.reset();
      player.weapon?.onComplete?.();
    };

    this.onLoop = () => {
      if (player.weapon?.ammo === 0) {
        this.reset();
      }
    };

    this.reset();
  }

  /**
   * Set the idle animation.
   */
  reset() {
    const { weapon } = this.player;

    if (weapon) {
      this.textures = this.textureCollection[weapon.name].idle;
      this.anchor.set(weapon.anchorX, weapon.anchorY);
      this.scale.set(weapon.scale * SCALE_RATIO);
    }

    this.gotoAndStop(0);
  }

  /**
   * Set the using animation.
   */
  fire() {
    const { name, automatic } = this.player.weapon;

    if ((automatic && !this.playing) || !automatic) {
      this.textures = this.textureCollection[name].firing;
      this.loop = automatic;
      this.gotoAndPlay(0);
    }
  }
}

export default WeaponSprite;
