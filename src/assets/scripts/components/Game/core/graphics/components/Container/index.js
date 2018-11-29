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

  /**
   * Add a child to the container.
   * @param {Object}  child          The child to add.
   * @param {Boolean} options.update Add child to updateable list.
   * @param {Boolean} options.hide   Add child to hideable list.
   */
  addChild(child, { update, hide } = {}) {
    super.addChild(child);

    if (update) {
      this.updateable.push(child);
    }

    if (hide) {
      this.hideable.push(child);
    }
  }

  /**
   * Remove a child from the container.
   * @param {Object}  child          The child to remove.
   * @param {Boolean} options.update Remove child from updateable list.
   * @param {Boolean} options.hide   Remove child from hideable list.
   */
  removeChild(child, { update, hide } = {}) {
    super.removeChild(child);

    if (update) {
      this.updateable = this.updateable.filter(updateableChild => updateableChild === child);
    }

    if (hide) {
      this.hideable = this.hideable.filter(hideableChild => hideableChild === child);
    }
  }

  /**
   * Play updateable children.
   */
  play() {
    this.updateable.forEach(child => child.play());
  }

  /**
   * Stop updateable children.
   */
  stop() {
    this.updateable.forEach(child => child.stop());
  }

  /**
   * Return the last child in the container.
   * @return {Object} The last child in the container.
   */
  lastChild() {
    const childrenLength = this.children.length;

    if (childrenLength) {
      return this.children[this.children.length - 1];
    }
    return null;
  }
}

export default Container;
