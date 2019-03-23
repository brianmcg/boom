import { Container } from '~/core/graphics';
import { SCREEN, MAX_FPS } from '~/constants/config';

const INTERVAL = 500;

const PADDING = 8;

const STEP = 1000 / MAX_FPS;
/**
 * Class representing a prompt container.
 */
export default class PromptContainer extends Container {
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
  update(delta) {
    this.counter += STEP * delta;

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
