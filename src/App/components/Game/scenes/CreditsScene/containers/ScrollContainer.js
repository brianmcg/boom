import { Container } from '@game/core/graphics';
import { SCREEN } from '@constants/config';

const PADDING = SCREEN.HEIGHT / 8;

const SPACE = SCREEN.WIDTH / 80;

const SCROLL_SPEED = SCREEN.HEIGHT / 480;

const SCROLL_COMPLETE_EVENT = 'scroll:complete';

export default class ScrollContainer extends Container {
  constructor({ logo, credits, end }) {
    super();
    const textHeight = credits[0][0].height;

    logo.anchor.set(0.5);
    // logo.scale.set(logo.height / SCREEN.HEIGHT / 2);

    logo.x = SCREEN.WIDTH / 2;
    logo.y = SCREEN.HEIGHT + logo.height / 2;

    this.addChild(logo);

    credits.forEach((credit, i) => {
      const [key, value] = credit;

      key.anchor.x = 1;
      key.x = SCREEN.WIDTH / 2 - SPACE;
      key.y = logo.y + logo.height + PADDING + (textHeight + PADDING) * i;

      value.anchor.x = 0;
      value.x = SCREEN.WIDTH / 2 + SPACE;
      value.y = key.y;

      this.addChild(key);
      this.addChild(value);
    });

    end.anchor.y = 1;
    end.x = SCREEN.WIDTH / 2;
    end.y =
      this.getChildAt(this.children.length - 1).y + SCREEN.HEIGHT + end.height;

    this.addChild(end);
  }

  onScrollComplete(callback) {
    this.on(SCROLL_COMPLETE_EVENT, callback);
  }

  scroll(ticker) {
    this.children.forEach(child => {
      child.y -= SCROLL_SPEED * ticker.deltaTime;
    });

    if (this.getChildAt(this.children.length - 1).y < SCREEN.HEIGHT / 2) {
      this.scrolling = false;
      this.emit(SCROLL_COMPLETE_EVENT);
    }
  }
}
