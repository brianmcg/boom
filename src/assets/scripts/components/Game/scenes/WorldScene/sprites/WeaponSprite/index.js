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
    super(textureCollection[player.weapon.name].idle, {
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
      weapon.onUse(() => this.setFiring());

      if (weapon.automatic) {
        weapon.onStop(() => this.setIdle());
      }
    });

    this.onComplete = () => this.setIdle();
  }

  /**
   * Set the idle animation.
   */
  setIdle() {
    this.textures = this.textureCollection[this.player.weapon.name].idle;
  }

  /**
   * Set the firing animation.
   */
  setFiring() {
    const { name, automatic } = this.player.weapon;

    if ((automatic && !this.playing) || !automatic) {
      this.textures = this.textureCollection[name].firing;
      this.loop = automatic;
      this.play();
    }
  }
}

export default WeaponSprite;
