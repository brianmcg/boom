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
   * @param {Boolean} options.play   Add child to playable list.
   * @param {Boolean} options.hide   Add child to hideable list.
   */
  addChild(child, { play, hide } = {}) {
    super.addChild(child);

    if (play) {
      this.playable.push(child);
    }

    if (hide) {
      this.hideable.push(child);
    }
  }

  /**
   * Remove a child from the container.
   * @param {Object}  child          The child to remove.
   * @param {Boolean} options.play Remove child from playable list.
   * @param {Boolean} options.hide   Remove child from hideable list.
   */
  removeChild(child, { play, hide } = {}) {
    super.removeChild(child);

    if (play) {
      this.playable = this.playable.filter(playableChild => playableChild === child);
    }

    if (hide) {
      this.hideable = this.hideable.filter(hideableChild => hideableChild === child);
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
   * Show the container.
   */
  show() {
    this.visible = true;
  }

  /**
   * Hide the container.
   */
  hide() {
    this.visible = false;
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
