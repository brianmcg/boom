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
    super(textureCollection[player.currentWeaponType], {
      animationSpeed: 0.3,
      loop: false,
      autoPlay: false,
    });

    this.textureCollection = textureCollection;
    this.x = this.centerX;
    this.y = this.centerY;
    this.width *= HEIGHT_RATIO;
    this.height *= HEIGHT_RATIO;
    this.centerX = (SCREEN.WIDTH / 2) - (this.width / 2);
    this.centerY = SCREEN.HEIGHT - this.height;
    this.player = player;
    this.onComplete = this.handleOnComplete.bind(this);

    this.player.onArmWeaponEvent((weaponType) => {
      this.textures = this.textureCollection[weaponType];
      this.texture = this.textures[0];
    });
  }

  /**
   * Updates the sprite.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    if (this.player.weapon.isFiring()) {
      if (this.playing) {
        super.update(delta);
      } else {
        this.play();
      }
    }
  }

  /**
   * Animate the weapon sprite.
   */
  animate() {
    const { weapon } = this.player;

    this.x = this.centerX + weapon.offsetX;
    this.y = this.centerY + weapon.offsetY;
  }

  /**
   * Handle on complete event.
   */
  handleOnComplete() {
    const { weapon } = this.player;

    this.gotoAndStop(0);

    if (weapon.isAutomatic()) {
      weapon.setIdle();
    } else {
      weapon.setDisabled();
    }
  }

  /**
   * Check id the sprite should be updated.
   * @return {Boolean} Should sprite be updated.
   */
  isUpdateable() {
    const { weapon } = this.player;
    return weapon.isFiring() || weapon.isArming();
  }
}

export default WeaponSprite;
