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
    this.playableChildren = [];
    this.animateableChildren = [];
    this.autoPlay = true;
    this.playing = false;
  }

  /**
   * Add a child to the container.
   * @param {Object}  child          The child to add.
   */
  addChild(child) {
    super.addChild(child);

    if (child.play) {
      this.playableChildren.push(child);
    }

    if (child.animate) {
      this.animateableChildren.push(child);
    }
  }

  /**
   * Remove a child from the container.
   * @param {Object}  child   The child to remove.
   */
  removeChild(child) {
    super.removeChild(child);

    if (child.play) {
      this.playableChildren = this.playableChildren.filter(p => p !== child);
    }

    if (child.animate) {
      this.animateableChildren = this.animateableChildren.filter(a => a !== child);
    }
  }

  /**
   * Remove all the container children.
   */
  removeChildren() {
    super.removeChildren();

    this.playableChildren = [];
    this.animateableChildren = [];
  }

  /**
   * Update the container.
   * @param  {Number} delta   The delta time.
   * @param  {Object} options The update options.
   */
  update(delta) {
    this.playableChildren.forEach(child => child.updateable && child.update(delta));
  }

  /**
   * Animate the container children.
   */
  animate() {
    this.animateableChildren.forEach(child => child.visible && child.animate());
  }

  /**
   * Play playable children.
   */
  play() {
    this.playing = true;
    this.playableChildren.forEach(child => child.autoPlay && child.play());
  }

  /**
   * Stop playable children.
   */
  stop() {
    this.playing = false;
    this.playableChildren.forEach(child => child.autoPlay && child.stop());
  }

  /**
   * updateable
   * @type {Boolean} Is the container updateable
   */
  get updateable() {
    return this.visible && this.playing;
  }
}

export default Container;
