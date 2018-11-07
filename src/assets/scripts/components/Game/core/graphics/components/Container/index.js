import * as PIXI from 'pixi.js';

/**
 * Class representing a Container.
 */
class Container extends PIXI.Container {
  /**
   * Creates a Container.
   */
  constructor() {
    super();

    this.on('added', () => {
      this.enabled = true;
    });

    this.on('removed', () => {
      this.enabled = false;
    });
  }
}

export default Container;
