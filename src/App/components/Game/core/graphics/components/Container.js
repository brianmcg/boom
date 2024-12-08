import { Container as PixiContainer } from 'pixi.js';

export default class Container extends PixiContainer {
  constructor() {
    super();
    this.playableChildren = [];
    this.fadeableChildren = [];
    this.playing = true;
  }

  addChild(child) {
    super.addChild(child);

    if (
      child.play &&
      !child.isComplete &&
      !this.playableChildren.includes(child)
    ) {
      this.playableChildren.push(child);
    }

    if (child.fade) {
      this.fadeableChildren.push(child);
    }
  }

  removeChild(child) {
    super.removeChild(child);

    if (child.play && (child.loop || !child.playing)) {
      this.playableChildren = this.playableChildren.filter(p => p !== child);
    }

    if (child.fade) {
      this.fadeableChildren = this.fadeableChildren.filter(p => p !== child);
    }
  }

  removeChildren() {
    super.removeChildren();

    this.playableChildren = [];
    this.fadeableChildren = [];
  }

  update(ticker) {
    this.playableChildren.forEach(
      child => child.playing && child.update(ticker)
    );
  }

  fade(amount, options) {
    this.fadeableChildren.forEach(child => child.fade(amount, options));
  }

  play() {
    this.playing = true;
    this.playableChildren.forEach(child => child.play());
  }

  stop() {
    this.playing = false;
    this.playableChildren.forEach(child => child.stop());
  }

  pause() {
    this.playing = false;
    this.playableChildren.forEach(child => child.pause());
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  destroy(options) {
    this.removeAllListeners();

    const children = this.children.map(child => child);

    this.removeChildren();

    children.forEach(child => {
      if (child instanceof Container) child.destroy(options);
    });

    this.removeFromParent(this);

    super.destroy(options);
  }

  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }
}
