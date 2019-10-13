import { AnimatedSprite } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

class WeaponSprite extends AnimatedSprite {
  constructor(textureCollection, weapon) {
    super(textureCollection[weapon.type], {
      animationSpeed: 0.4,
      loop: false,
      àutoPlay: false,
    });

    this.currentWeaponTextures = weapon.type;
    this.textureCollection = textureCollection;

    this.width *= 2;
    this.height *= 2;

    this.x = (SCREEN.WIDTH / 2) - (this.width / 2);
    this.y = (SCREEN.HEIGHT / 2) - (this.height / 2);

    this.centerX = (SCREEN.WIDTH / 2) - (this.width / 2);
    this.centerY = (SCREEN.HEIGHT / 2) - (this.height / 2);

    this.x = this.centerX;
    this.y = this.centerY;

    this.weapon = weapon;

    this.onComplete = () => {
      this.gotoAndStop(0);

      if (this.weapon.isFiring()) {
        this.weapon.setDisabled();
      }
    };
    // this.y = SCREEN.HEIGHT / 2; // - 10;
  }

  animate() {
    const { offsetX, offsetY } = this.weapon;

    this.x = this.centerX + offsetX;
    this.y = this.centerY + offsetY;

    if (!this.playing && this.weapon.isFiring()) {
      this.play();
    }
  }

  // animate(player) {
  //   if (!player.changingWeapon) {
  //     if (this.currentWeaponTextures !== player.currentWeapon.name) {
  //       this.currentWeaponTextures = player.currentWeapon.name;
  //       this.textures = this.textureCollection[player.currentWeapon.name];
  //       this.texture = this.textures[0];
  //     }
  //   }

  //   if (this.playing && !player.currentWeapon.firing) {
  //     this.gotoAndStop(0);
  //   }

  //   if (player.currentWeapon.shoot && player.currentWeapon.firing) {
  //     if (!this.playing) {
  //       this.play();
  //     }
  //   }
  // }
}

export default WeaponSprite;
