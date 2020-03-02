import { AnimatedSprite } from 'game/core/graphics';
import { TIME_STEP } from 'game/constants/config';

const INTERVAL = 5000;

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

    this.timer = 0;
    this.onLoop = this.handleOnLoop.bind(this);
  }

  /**
   * Handle the on loop event.
   */
  handleOnLoop() {
    this.isInterval = true;
  }

  /**
   * Update the sprite.
   * @param  {Number} delta The delta time.
   */
  update(delta = 1) {
    if (this.isInterval) {
      this.timer += delta * TIME_STEP;

      if (this.timer >= INTERVAL) {
        this.timer = 0;
        this.isInterval = false;
      }
    } else {
      super.update(delta);
    }
  }

  // /**
  //  * Play the sprite.
  //  */
  // play() {
  //   this.visible = true;
  // }

  // /**
  //  * Stop the sprite.
  //  */
  // stop() {
  //   this.visible = false;
  // }
}

export default LogoSprite;
