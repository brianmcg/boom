import { Container as PixiContainer } from '../../pixi';

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
    this.fadeableChildren = [];
    this.playing = true;
  }

  /**
   * Add a child to the container.
   * @param {Object}  child   The child to add.
   */
  addChild(child) {
    super.addChild(child);

    if (child.play && !child.isComplete && !this.playableChildren.includes(child)) {
      this.playableChildren.push(child);
    }

    if (child.fade) {
      this.fadeableChildren.push(child);
    }
  }

  /**
   * Remove a child from the container.
   * @param {Object}  child   The child to remove.
   */
  removeChild(child) {
    super.removeChild(child);

    if (child.play && (child.loop || !child.playing)) {
      this.playableChildren = this.playableChildren.filter(p => p !== child);
    }

    if (child.fade) {
      this.fadeableChildren = this.fadeableChildren.filter(p => p !== child);
    }
  }

  /**
   * Remove all the container children.
   */
  removeChildren() {
    super.removeChildren();

    this.playableChildren = [];
    this.fadeableChildren = [];
  }

  /**
   * Update the container.
   * @param  {Number} delta   The delta time.
   * @param  {Object} options The update options.
   */
  update(delta, elapsedMS) {
    this.playableChildren.forEach(child => child.playing && child.update(delta, elapsedMS));
  }

  /**
   * Update the fade effect.
   * @param  {Number} value The value of the effect.
   */
  fade(amount, options) {
    this.fadeableChildren.forEach(child => child.fade(amount, options));
  }

  /**
   * Play playable children.
   */
  play() {
    this.playing = true;
    this.playableChildren.forEach(child => child.play());
  }

  /**
   * Stop playable children.
   */
  stop() {
    this.playing = false;
    this.playableChildren.forEach(child => child.stop());
  }

  /**
   * Pause the container.
   */
  pause() {
    this.playing = false;
    this.playableChildren.forEach(child => child.pause());
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
}

export default Container;
