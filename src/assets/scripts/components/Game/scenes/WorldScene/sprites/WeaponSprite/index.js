import { AnimatedSprite } from '~/core/graphics';
import { SCREEN } from '~/constants/config';
import Weapon from '../../entities/Weapon';

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
    super(textureCollection[player.weapon.type || Weapon.TYPES.PISTOL], {
      animationSpeed: 0.4,
      loop: false,
      autoPlay: false,
    });

    this.currentWeaponTextures = player.weapon.type;
    this.textureCollection = textureCollection;

    this.width *= 2;
    this.height *= 2;

    this.centerX = (SCREEN.WIDTH / 2) - (this.width / 2);
    this.centerY = SCREEN.HEIGHT - this.height;

    this.x = this.centerX;
    this.y = this.centerY;

    this.player = player;

    this.onComplete = () => {
      this.gotoAndStop(0);
      player.weapon.setDisabled();
    };
  }

  /**
   * Updates the sprite.
   * @param  {[Number} delta Te delta time.h
   */
  update(delta) {
    const { weapon } = this.player;
    const { ARMING, FIRING } = Weapon.STATES;

    switch (weapon.state) {
      case FIRING: this.updateFiring(); break;
      case ARMING: this.updateArming(); break;
      default: break;
    }

    if (this.playing) {
      super.update(delta);
    }
  }

  /**
   * Update when weapon is in firing state.
   */
  updateFiring() {
    if (!this.playing) {
      this.play();
    }
  }

  /**
   * Update when weapon is in arming state.
   */
  updateArming() {
    const { nextWeaponType, currentWeaponType } = this.player;

    if (nextWeaponType === currentWeaponType) {
      this.textures = this.textureCollection[currentWeaponType];
      this.texture = this.textures[0];
    }
  }

  /**
   * Animate the weapon sprite.
   * @return {[type]} [description]
   */
  animate() {
    const { weapon } = this.player;

    this.x = this.centerX + weapon.offsetX;
    this.y = this.centerY + weapon.offsetY;
  }


  /**
   * updateable
   * @type {Boolean} Is the sprite updateable
   */
  get updateable() {
    const { weapon } = this.player;
    return weapon.isFiring() || weapon.isArming();
  }
}

export default WeaponSprite;
