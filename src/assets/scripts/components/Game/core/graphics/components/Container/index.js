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
    this.updateable = [];
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

    if (child.update) {
      this.updateable.push(child);
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

    if (child.update) {
      this.updateable = this.updateable.filter(u => u !== child);
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

  /**
   * Return the last child in the container.
   * @return {Object} The last child in the container.
   */
  lastChild() {
    if (this.children.length) {
      return this.children[this.children.length - 1];
    }
    return null;
  }
}

export default Container;
