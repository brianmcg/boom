import { AnimatedSprite } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

class WeaponSprite extends AnimatedSprite {
  constructor(textureCollection, player) {
    super(textureCollection[player.weapon.type], {
      animationSpeed: 0.4,
      loop: false,
      autoPlay: false,
    });

    this.currentWeaponTextures = player.weapon.type;
    this.textureCollection = textureCollection;

    this.width *= 2;
    this.height *= 2;

    this.x = (SCREEN.WIDTH / 2) - (this.width / 2);
    this.y = (SCREEN.HEIGHT / 2) - (this.height / 2);

    this.centerX = (SCREEN.WIDTH / 2) - (this.width / 2);
    this.centerY = (SCREEN.HEIGHT / 2) - (this.height / 2);

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

  animate() {
    const { weapon } = this.player;

    this.x = this.centerX + weapon.offsetX;
    this.y = this.centerY + weapon.offsetY;

    if (!this.playing && weapon.isFiring()) {
      this.play();
    }
  }
}

export default WeaponSprite;
