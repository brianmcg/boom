import { Container as PixiContainer } from 'pixi.js';

/**
 * Class representing a Container.
 */
export default class Container extends PixiContainer {
  /**
   * Creates a Container.
   */
  constructor() {
    super();
    this.playable = [];
    this.animateable = [];
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
   * Update the container.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    this.playable.forEach(child => child.playing && child.update(delta));
  }

  /**
   * Stop playable children.
   */
  stop() {
    this.playable.forEach(child => child.stop());
  }
}
