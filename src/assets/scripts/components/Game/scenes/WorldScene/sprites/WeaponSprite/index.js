import { AnimatedSprite } from '~/core/graphics';
import { SCREEN } from '~/constants/config';
import Weapon from '../../entities/Weapon';

class WeaponSprite extends AnimatedSprite {
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

      if (player.weapon.isFiring()) {
        player.weapon.setDisabled();
      }
    };
    // this.y = SCREEN.HEIGHT / 2; // - 10;
  }

  update(delta) {
    if (this.playing) {
      super.update(delta);
    }
  }

  animate() {
    const { weapon, nextWeaponType, currentWeaponType } = this.player;

    if (weapon.isArming()) {
      if (nextWeaponType === currentWeaponType) {
        this.textures = this.textureCollection[currentWeaponType];
        this.texture = this.textures[0];
      }
    }

    this.x = this.centerX + weapon.offsetX;
    this.y = this.centerY + weapon.offsetY;

    if (!this.playing && weapon.isFiring()) {
      this.play();
    }
  }

  /**
   * updateable
   * @type {Boolean} Is the sprite updateable
   */
  get updateable() {
    const { weapon } = this.player;
    return weapon.isFiring();
  }
}

export default WeaponSprite;
