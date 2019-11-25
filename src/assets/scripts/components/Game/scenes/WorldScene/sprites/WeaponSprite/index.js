import { AnimatedSprite } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';
import { Weapon } from '../../entities/Player';

const HEIGHT_RATIO = SCREEN.HEIGHT / 172;

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
      animationSpeed: 0.4,
      loop: false,
      autoPlay: false,
    });

    this.currentWeaponTextures = player.weapon.type;
    this.textureCollection = textureCollection;
    this.x = this.centerX;
    this.y = this.centerY;
    this.width *= HEIGHT_RATIO;
    this.height *= HEIGHT_RATIO;
    this.centerX = (SCREEN.WIDTH / 2) - (this.width / 2);
    this.centerY = SCREEN.HEIGHT - this.height;
    this.player = player;
    this.onComplete = this.handleOnComplete.bind(this);
  }

  /**
   * Updates the sprite.
   * @param  {[Number} delta Te delta time.h
   */
  update(delta) {
    const { weapon } = this.player;
    const { ARMING, FIRING } = Weapon.STATES;

    switch (weapon.state) {
      case FIRING:
        this.updateFiring(delta);
        break;
      case ARMING:
        this.updateArming(delta);
        break;
      default:
        break;
    }
  }

  /**
   * Update when weapon is in firing state.
   */
  updateFiring(delta) {
    if (this.playing) {
      super.update(delta);
    } else {
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
      this.player.nextWeaponType = null;
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
   * Handle on complete event.
   */
  handleOnComplete() {
    const { weapon } = this.player;

    if (weapon.isAutomatic()) {
      weapon.setIdle();
    } else {
      weapon.setDisabled();
    }

    this.gotoAndStop(0);
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
