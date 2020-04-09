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

    Object.values(player.weapons).forEach((weapon) => {
      weapon.onFireEvent(() => this.setFiring());

      weapon.onDisabledEvent(() => this.setIdle());
    });

    this.onComplete = () => player.weapon.setDisabled();
  }

  /**
   * Set the idle animation.
   */
  setIdle() {
    console.log('setIdle');
    this.textures = this.textureCollection[this.player.currentWeaponType].idle;
  }

  /**
   * Set the firing animation.
   */
  setFiring() {
    this.textures = this.textureCollection[this.player.currentWeaponType].firing;
    this.play();
  }

  /**
   * Play the sprite.
   */
  play() {
    if (this.player.weapon.isFiring()) super.play();
  }
}

export default WeaponSprite;
