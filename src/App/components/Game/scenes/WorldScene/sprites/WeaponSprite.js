import { AnimatedSprite } from '@game/core/graphics';
import { SCREEN } from '@constants/config';

const SCALE_RATIO = SCREEN.HEIGHT / 180;

export default class WeaponSprite extends AnimatedSprite {
  constructor(textureCollection, player) {
    super(textureCollection[player.weapons[0].name].idle, {
      animationSpeed: 0.25,
      loop: false,
    });

    this.textureCollection = textureCollection;

    this.player = player;

    this.x = SCREEN.WIDTH / 2;
    this.y = SCREEN.HEIGHT;

    player.onUseWeapon(() => {
      this.fire();
    });

    player.onUnarmWeapon(() => {
      this.reset();
    });

    player.onArmWeapon(() => {
      this.reset();
    });

    player.onReleaseWeapon(() => {
      this.loop = false;
    });

    this.onComplete = () => {
      this.reset();
      player.weapon?.onComplete?.();
    };

    this.onLoop = () => {
      if (player.weapon?.ammo === 0) {
        this.reset();
      }
    };

    this.reset();
  }

  reset() {
    const { weapon } = this.player;

    if (weapon) {
      this.textures = this.textureCollection[weapon.name].idle;
      this.anchor.set(weapon.anchorX, weapon.anchorY);
      this.scale.set(weapon.scale * SCALE_RATIO);
    }

    this.gotoAndStop(0);
  }

  fire() {
    const { name, automatic } = this.player.weapon;

    if ((automatic && !this.playing) || !automatic) {
      this.textures = this.textureCollection[name].firing;
      this.loop = automatic;
      this.gotoAndPlay(0);
    }
  }

  destroy(options) {
    Object.values(this.textureCollection).forEach(({ idle, firing }) => {
      idle.forEach(texture => texture.destroy());
      firing.forEach(texture => texture.destroy());
    });

    super.destroy(options);
    this.onComplete = null;
    this.onLoop = null;
    this.textureCollection = null;
    this.player = null;
  }
}
