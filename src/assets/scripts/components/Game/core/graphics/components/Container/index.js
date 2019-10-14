import { Container as PixiContainer } from 'pixi.js';

/**
 * Class representing a Container.
 */
class Container extends PixiContainer {
  /**
   * Creates a Container.
   */
  constructor() {
    super();
    this.playable = [];
    this.animateable = [];
    this.autoPlay = true;
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

    if (child.animate) {
      this.animateable.push(child);
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

    if (child.animate) {
      this.animateable = this.animateable.filter(a => a !== child);
    }
  }

  removeChildren() {
    super.removeChildren();

    this.playable = [];
    this.animateable = [];
  }

  /**
   * Update the container.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    this.playable.forEach(child => child.visible && child.playing && child.update(delta));
  }

  /**
   * Animate the container children.
   */
  animate() {
    this.animateable.forEach(child => child.visible && child.animate());
  }

  /**
   * Play playable children.
   */
  play() {
    this.playing = true;
    this.playable.forEach(child => child.autoPlay && child.play());
  }

  /**
   * Stop playable children.
   */
  stop() {
    this.playing = false;
    this.playable.forEach(child => child.autoPlay && child.stop());
  }
}

export default Container;
