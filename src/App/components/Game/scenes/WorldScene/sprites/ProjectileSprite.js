import AnimatedEntitySprite from './AnimatedEntitySprite';

/**
 * Class representing an explosive sprite.
 */
export default class ProjectileSprite extends AnimatedEntitySprite {
  constructor(textures, { rotate = 0, ...other } = {}) {
    super(textures, other);
    this.rotate = rotate;
  }

  // update(ticker) {
  //   super.update(ticker);

  //   if (this.rotate) {
  //     this.rotation += this.rotate * ticker.deltaTime;
  //   }
  // }
}
