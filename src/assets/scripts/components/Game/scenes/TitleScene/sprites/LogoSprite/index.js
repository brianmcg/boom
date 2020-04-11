import { AnimatedSprite } from 'game/core/graphics';
import { TIME_STEP, SCREEN } from 'game/constants/config';

const INTERVAL = 4000;

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

    this.setScale(this.maxScale);

    this.onLoop = () => {
      this.animationEnabled = true;
    };
  }

  /**
   * Update the sprite in the static state.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    if (this.animationEnabled) {
      this.timer += delta * TIME_STEP;

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
    this.setScale((1 - value) * this.maxScale);
  }
}

export default LogoSprite;
