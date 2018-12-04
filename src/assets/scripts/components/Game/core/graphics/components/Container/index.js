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
    this.playable = [];
  }

  /**
   * Add a child to the container.
   * @param {Object}  child          The child to add.
   */
  addChild(child) {
    super.addChild(child);

    if (child.play) {
      this.playable.push(child);
    }
  }

  /**
   * Remove a child from the container.
   * @param {Object}  child          The child to remove.
   */
  removeChild(child) {
    super.removeChild(child);

    if (child.play) {
      this.playable = this.playable.filter(p => p !== child);
    }
  }

  /**
   * Play playable children.
   */
  play() {
    this.playable.forEach(child => child.play());
  }

  /**
   * Stop playable children.
   */
  stop() {
    this.playable.forEach(child => child.stop());
  }
}

export default Container;
