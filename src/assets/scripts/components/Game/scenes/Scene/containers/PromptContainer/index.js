import { Container } from '~/core/graphics';
import { SCREEN, TIME_STEP } from '~/constants/config';

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
    this.timer = 0;
  }

  /**
   * Update the container.
   * @param  {Number} delta     The delta time.
   * @param  {Number} elapsedMS The elapsed time.
   */
  update(delta) {
    this.timer += TIME_STEP * delta;

    if (this.timer >= INTERVAL) {
      this.timer = 0;
    }
  }

  /**
   * Animate the container.
   * @return {[type]} [description]
   */
  animate() {
    if (!this.timer) {
      this.children.forEach((child) => {
        child.visible = !child.visible;
      });
    }
  }

  /**
   * Add a child to the container.
   * @param {TextSprite} options.label The label to add.
   */
  addChild({ label }) {
    label.x = (SCREEN.WIDTH / 2) - (label.width / 2);
    label.y = SCREEN.HEIGHT - label.height - PADDING;
    super.addChild(label);
  }

  /**
   * Handle state change to paused.
   */
  setPaused() {
    this.visible = false;
  }

  /**
   * Handle state change to running.
   */
  setRunning() {
    this.visible = true;
  }
}

export default PromptContainer;
