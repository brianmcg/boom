import { AnimatedSprite } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

class WeaponSprite extends AnimatedSprite {
  constructor(textureCollection) {
    super(textureCollection.pistol, {
      animationSpeed: 0.4,
      loop: false,
    });

    this.currentWeaponTextures = 'pistol';
    this.textureCollection = textureCollection;

    this.width *= 2;
    this.height *= 2;

    this.x = (SCREEN.WIDTH / 2) - (this.width / 2);
    this.y = (SCREEN.HEIGHT / 2) - (this.height / 2);

    // this.y = SCREEN.HEIGHT / 2; // - 10;

    this.onComplete = () => this.gotoAndStop(0);
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
