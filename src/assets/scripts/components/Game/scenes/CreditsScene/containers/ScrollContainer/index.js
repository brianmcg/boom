import { Container } from 'game/core/graphics';
import { SCREEN } from 'game/constants/config';

const TEXT_PADDING = SCREEN.HEIGHT / 40;

const SCROLL_SPEED = SCREEN.HEIGHT / 280;

const SCROLL_COMPLETE_EVENT = 'scroll:complete';

/**
 * Class representing a scroll container.
 */
class ScrollContainer extends Container {
  /**
   * Creates a scroll container.
   * @param  {Object}     options.credits The credits data.
   * @param  {TextSprite} options.end     The end text.
   */
  constructor({ credits, end }) {
    super();

    let y = 0;

    credits.forEach((credit) => {
      credit.forEach((text, i) => {
        text.x = SCREEN.WIDTH / 2;
        text.y = y;
        y += text.height + TEXT_PADDING;
        if (!i) {
          y += TEXT_PADDING;
        }
        this.addChild(text);
      });
      y += TEXT_PADDING * 5;
    });

    end.x = SCREEN.WIDTH / 2;
    end.y = y + SCREEN.HEIGHT;

    this.y = SCREEN.HEIGHT;

    this.addChild(end);
  }

  /**
   * Add a callback for the scoll complete event.
   * @param  {Function} callback The callback function.
   */
  onScrollComplete(callback) {
    this.on(SCROLL_COMPLETE_EVENT, callback);
  }

  /**
   * Updates the scroll container.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    const lastSprite = this.children[this.children.length - 1];
    const yEnd = SCREEN.HEIGHT - (lastSprite.height * 2) - this.height;

    this.y -= delta * SCROLL_SPEED;

    if (this.y <= yEnd) {
      this.y = yEnd;
      this.emit(SCROLL_COMPLETE_EVENT);
    }
  }
}

export default ScrollContainer;
