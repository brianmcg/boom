import { Container } from '~/core/graphics';
import { SCREEN, TIME_STEP } from '~/constants/config';

const INTERVAL = 500;

const PADDING = 8;

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
    this.show = true;
  }

  /**
   * Update the container.
   * @param  {Number} delta     The delta time.
   * @param  {Number} elapsedMS The elapsed time.
   */
  update(delta) {
    this.counter += TIME_STEP * delta;
    if (this.counter >= INTERVAL) {
      this.counter = 0;
    }
  }

  /**
   * Add a child to the container.
   * @param {BitmapText} options.label The label to add.
   */
  addChild({ label }) {
    label.x = (SCREEN.WIDTH / 2) - (label.width / 2);
    label.y = SCREEN.HEIGHT - label.height - PADDING;
    super.addChild(label);
  }

  /**
   * Handle state change to paused.
   */
  onPaused() {
    this.visible = false;
  }

  /**
   * Handle state change to running.
   */
  onRunning() {
    this.visible = true;
  }

  animate() {
    if (!this.counter) {
      this.children.forEach((child) => {
        child.visible = !child.visible;
      });
    }
  }
}
