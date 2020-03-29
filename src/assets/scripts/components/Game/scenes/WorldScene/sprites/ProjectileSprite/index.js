import AnimatedEntitySprite from '../AnimatedEntitySprite';

/**
 * Class representing a projectile sprite.
 * @extends {AnimatedEntitySprite}
 */
class ProjectileSprite extends AnimatedEntitySprite {
  /**
   * Creates a projectile sprite.
   * @param  {Enemy}  projectile        The projectile.
   * @param  {Array}  textureCollection The textures for the sprite.
   */
  constructor(projectile, textures) {
    super(textures, {
      animationSpeed: 0.15,
      loop: true,
    });
  }
}

export default ProjectileSprite;
