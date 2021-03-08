import AnimatedEntitySprite from '../AnimatedEntitySprite';

/**
 * Class representing an explosive sprite.
 */
class ProjectileSprite extends AnimatedEntitySprite {
  constructor(textures, { rotate = 0, ...other } = {}) {
    super(textures, other);

    this.rotate = rotate;
  }

  update(delta) {
    super.update(delta);

    if (this.rotate) {
      this.rotation += this.rotate * delta;
    }
  }
}

export default ProjectileSprite;
