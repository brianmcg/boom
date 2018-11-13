import { Container } from '~/core/graphics';

const INTERVAL = 500;

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
    }
  }

  /**
   * Render the container.
   * @return {[type]} [description]
   */
  render() {
    if (!this.counter) {
      this.visible = !this.visible;
    }
  }
}

export default PromptContainer;
