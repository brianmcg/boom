import {
  Container as PixiContainer,
  type ContainerChild,
  type DestroyOptions,
  type Ticker,
} from 'pixi.js';

/**
 * A child this container drives each frame, or fades. Both are duck-typed: a
 * child qualifies by having the method, not by extending anything, and Pixi's
 * own children may be added alongside.
 */
interface PlayableChild extends ContainerChild {
  play(): void;
  stop(): void;
  pause(): void;
  update(ticker: Ticker): void;
  playing?: boolean;
  loop?: boolean;
  isComplete?: boolean;
}

interface FadeableChild extends ContainerChild {
  fade(amount: number, options?: unknown): void;
}

const isPlayable = (child: ContainerChild): child is PlayableChild =>
  'play' in child;

const isFadeable = (child: ContainerChild): child is FadeableChild =>
  'fade' in child;

export default class Container extends PixiContainer {
  playableChildren: PlayableChild[];

  fadeableChildren: FadeableChild[];

  playing: boolean;

  /** Subclass-defined label, and only ever set through {@link setState}. */
  state?: string;

  constructor() {
    super();
    this.interactiveChildren = false;
    this.eventMode = 'none';
    this.playableChildren = [];
    this.fadeableChildren = [];
    this.playing = true;
  }

  addChild<T extends ContainerChild[]>(...children: T): T[0] {
    const added = super.addChild(...children);
    const [child] = children;

    if (
      isPlayable(child) &&
      !child.isComplete &&
      !this.playableChildren.includes(child)
    ) {
      this.playableChildren.push(child);
    }

    if (isFadeable(child)) {
      this.fadeableChildren.push(child);
    }

    return added;
  }

  removeChild<T extends ContainerChild[]>(...children: T): T[0] {
    const removed = super.removeChild(...children);
    const [child] = children;

    if (isPlayable(child) && (child.loop || !child.playing)) {
      this.playableChildren = this.playableChildren.filter(p => p !== child);
    }

    if (isFadeable(child)) {
      this.fadeableChildren = this.fadeableChildren.filter(p => p !== child);
    }

    return removed;
  }

  removeChildren(): ContainerChild[] {
    this.playableChildren = [];
    this.fadeableChildren = [];
    return super.removeChildren();
  }

  update(ticker: Ticker) {
    this.playableChildren.forEach(
      child => child.playing && child.update(ticker)
    );
  }

  fade(amount: number, options?: unknown) {
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

  destroy(options?: DestroyOptions) {
    super.destroy(options);

    this.playableChildren = [];
    this.fadeableChildren = [];
    this.filters = [];
  }

  setState(state: string): boolean {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }
}
