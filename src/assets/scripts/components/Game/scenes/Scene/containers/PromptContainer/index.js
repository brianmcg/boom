import { Container } from '~/core/graphics';
import { SCREEN } from '~/constants/config';

const INTERVAL = 500;

const PADDING = 8;

/**
 * Class representing a prompt container.
 */
class PromptContainer extends Container {
  /**
   * Create a prompt container
   */
  constructor() {
    super();
    this.counter = 0;
  }

  /**
   * Update the container.
   * @param  {Number} delta     The delta time.
   * @param  {Number} elapsedMS The elapsed time.
   */
  update(delta, elapsedMS) {
    this.counter += elapsedMS;

    if (this.counter >= INTERVAL) {
      this.counter = 0;
      this.visible = !this.visible;
    }
  }

  addChild({ text }) {
    text.x = (SCREEN.WIDTH / 2) - (text.width / 2);
    text.y = SCREEN.HEIGHT - text.height - PADDING;
    super.addChild(text);
  }
}

export default PromptContainer;
