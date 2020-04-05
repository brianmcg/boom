import { AnimatedSprite } from 'game/core/graphics';
import { TIME_STEP, SCREEN } from 'game/constants/config';

const INTERVAL = 5000;

const SCALE_INCREMENT = 0.075;

const STATES = {
  FADING_IN: 'logo:fading:in',
  STATIC: 'logo:static',
  FADING_OUT: 'logo:fading:out',
};

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
   * Play the sprite.
   */
  play() {
    this.visible = true;
  }

  /**
   * Stop the sprite.
   */
  stop() {
    this.visible = false;
  }
}

export default LogoSprite;
