import { Container as PixiContainer } from 'pixi.js';

/**
 * Class representing a Container.
 * @extends {PIXI.Container}
 */
class Container extends PixiContainer {
  /**
   * Creates a Container.
   */
  constructor() {
    super();
    this.playableChildren = [];
    this.playing = true;
  }

  /**
   * Add a child to the container.
   * @param {Object}  child   The child to add.
   */
  addChild(child) {
    super.addChild(child);

    if (child.play) {
      this.playableChildren.push(child);
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
  }

  /**
   * Remove all the container children.
   */
  removeChildren() {
    super.removeChildren();

    this.playableChildren = [];
  }

  /**
   * Update the container.
   * @param  {Number} delta   The delta time.
   * @param  {Object} options The update options.
   */
  update(delta) {
    this.playableChildren.forEach(child => child.playing && child.update(delta));
  }

  /**
   * Update the fade effect.
   * @param  {Number} value The value of the effect.
   */
  fade(...options) {
    this.children.forEach(child => child.fade && child.fade(...options));
  }

  /**
   * Play playable children.
   */
  play() {
    this.playing = true;
    this.playableChildren.forEach(child => child.play && child.play());
  }

  /**
   * Stop playable children.
   */
  stop() {
    this.playing = false;
    this.playableChildren.forEach(child => child.play && child.stop());
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
   * Set the container scale.
   * @param {Number} amount the scale amount.
   */
  setScale(amount) {
    this.scale.x = amount;
    this.scale.y = amount;
  }

  /**
   * Get the scale of the container.
   * @return {Number} The scale value.
   */
  getScale() {
    return this.scale.x;
  }

  /**
   * Set the container state.
   * @param {String} state The new state.
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }

  isUpdateable() {
    return this.visible;
  }
}

export default Container;
