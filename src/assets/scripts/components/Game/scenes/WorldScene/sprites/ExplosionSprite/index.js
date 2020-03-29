import AnimatedEntitySprite from '../AnimatedEntitySprite';

class ExplosionSprite extends AnimatedEntitySprite {
  constructor(textures) {
    super(textures, {
      loop: false,
    });

    this.onComplete = () => {
      this.gotoAndStop(0);
      this.parent.removeChild(this);
    };
  }
}

export default ExplosionSprite;
