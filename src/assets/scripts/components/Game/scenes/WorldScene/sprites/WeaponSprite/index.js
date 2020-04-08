import { AnimatedSprite } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';

const HEIGHT_RATIO = SCREEN.HEIGHT / 190;

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
    super(textureCollection[player.currentWeaponType].idle, {
      animationSpeed: 0.3,
      loop: false,
    });

    this.textureCollection = textureCollection;
    this.width *= HEIGHT_RATIO;
    this.height *= HEIGHT_RATIO;
    this.x = SCREEN.WIDTH / 2;
    this.y = SCREEN.HEIGHT - (this.height / 2);
    this.player = player;
    this.anchor.set(0.5);

    this.onComplete = () => {
      const { weapon } = this.player;
      if (weapon.isFiring()) {
        weapon.setIdle();
        this.setIdle();
      }
    };
  }

  setFiring() {
    this.textures = this.textureCollection[this.player.currentWeaponType].firing;
    this.play();
  }

  setIdle() {
    this.textures = this.textureCollection[this.player.currentWeaponType].idle;
  }

  /**
   * Play the sprite.
   */
  play() {
    if (this.player.weapon.isFiring()) super.play();
  }
}

export default WeaponSprite;
