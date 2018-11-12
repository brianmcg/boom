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

    this.updateable = [];

    this.on('added', () => {
      this.enabled = true;
    });

    this.on('removed', () => {
      this.enabled = false;
    });
  }

  addChild(child, { update = false } = {}) {
    super.addChild(child);

    if (update) {
      this.updateable.push(child);
    }
  }

  removeChild(child, { update = false } = {}) {
    super.removeChild(child);

    if (update) {
      this.updateable = this.updateable.filter(updateableChild => updateableChild === child);
    }
  }
}

export default Container;
