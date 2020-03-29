import AnimatedEntitySprite from '../AnimatedEntitySprite';

const STATES = {
  TRAVELLING: 'travelling',
  EXPLODING: 'exploding',
};

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
  constructor(projectile, textureCollection) {
    super(textureCollection[STATES.TRAVELLING], {
      animationSpeed: 0.15,
      loop: true,
    });

    projectile.onExplode(() => {
      this.loop = false;
      this.textures = textureCollection[STATES.EXPLODING];
    });

    this.onComplete = () => {
      projectile.world.remove(projectile);
    };
  }
}

export default ProjectileSprite;
