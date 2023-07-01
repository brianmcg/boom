import { AnimatedSprite } from '@game/core/graphics';
import { SCREEN } from '@game/constants/config';

const INTERVAL = 3000;

/**
 * Class representing a logo sprite.
 */
class LogoSprite extends AnimatedSprite {
  /**
   * Creates a logo sprite.
   * @param  {Array}  textures The sprite textures.
   */
  constructor(textures = []) {
    super(textures, {
      animationSpeed: 0.25,
      loop: true,
    });

    this.maxScale = SCREEN.HEIGHT / this.height / 2;
    this.timer = 0;
    this.anchor.set(0.5);

    this.scale.set(this.maxScale);

    this.onLoop = () => {
      this.animationEnabled = true;
    };
  }

  /**
   * Update the sprite in the static state.
   * @param  {Number} delta The delta time.
   */
  update(delta, elapsedMS) {
    if (this.animationEnabled) {
      this.timer += elapsedMS;

      if (this.timer >= INTERVAL) {
        this.timer = 0;
        this.animationEnabled = false;
      }
    } else {
      super.update(delta);
    }
  }

  /**
   * Update the pause effect.
   * @param  {Number} value The value of the effect.
   */
  fade(value) {
    this.scale.set((1 - value) * this.maxScale);
  }
}

export default LogoSprite;
