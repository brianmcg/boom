import { AnimatedSprite } from '~/core/graphics';

class WeaponSprite extends AnimatedSprite {
  constructor(textureCollection) {
    super(textureCollection.pistol, {
      animationSpeed: 0.4,
      loop: false,
    });

    this.currentWeaponTextures = 'pistol';
    this.textureCollection = textureCollection;

    // this.texture = this.textures[0];

    // this.stop();

    // this.gotoAndStop(0);

    // this.onComplete = () => this.gotoAndStop(0);
  }

  // update(delta) {

  // }

  // updateAnimation(player) {
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
