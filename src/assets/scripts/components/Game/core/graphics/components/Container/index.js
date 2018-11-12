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
    this.hideable = [];

    this.on('added', () => {
      this.enabled = true;
    });

    this.on('removed', () => {
      this.enabled = false;
    });
  }

  addChild(child, { update, hide } = {}) {
    super.addChild(child);

    if (update) {
      this.updateable.push(child);
    }

    if (hide) {
      this.hideable.push(child);
    }
  }

  removeChild(child, { update, hide } = {}) {
    super.removeChild(child);

    if (update) {
      this.updateable = this.updateable.filter(updateableChild => updateableChild === child);
    }

    if (hide) {
      this.hideable = this.hideable.filter(hideableChild => hideableChild === child);
    }
  }
}

export default Container;
