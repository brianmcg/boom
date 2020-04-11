import { Container } from 'game/core/graphics';
import { RED, WHITE } from 'game/constants/colors';
import { SCREEN } from 'game/constants/config';

const SCREEN_PADDING = 6;

const ICON_PADDING_RIGHT = 5;

const MAX_ALPHA = 0.7;

/**
 * A class representing a menu container.
 */
class MenuContainer extends Container {
  /**
   * Creates a menu container.
   * @param  {Object} sprites The sprites.
   */
  constructor(sprites) {
    super();

    this.sprites = sprites;
    this.scaleFactor = 0;
    this.alphaFactor = 0;

    const { icon, labels, background } = this.sprites;

    this.addChild(background);

    if (labels.length) {
      this.addChild(icon);

      labels.forEach((sprite, index) => {
        const totalHeight = (sprite.height + SCREEN_PADDING) * labels.length;

        sprite.x = (SCREEN.WIDTH / 2);
        sprite.y = ((SCREEN.HEIGHT / 2) - (totalHeight / 2))
          + (index * sprite.height) + (index * SCREEN_PADDING);

        this.addChild(sprite);
      });
    }


    this.on('added', () => this.setIndex(0));
  }

  /**
   * Update the container.
   */
  update(delta) {
    super.update(delta);

    const { icon, labels, background } = this.sprites;

    icon.setScale(this.scaleFactor);

    background.alpha = this.alphaFactor;

    labels.forEach((child, i) => {
      child.setScale(this.scaleFactor);

      if (i === this.index) {
        icon.y = child.y;
        icon.x = child.x - (child.width / 2) - ICON_PADDING_RIGHT - (icon.width / 2);
      }
    });
  }

  /**
   * Update the pause effect.
   * @param  {Number} value The value of the effect.
   */
  fade(value) {
    this.alphaFactor = value * MAX_ALPHA;
    this.scaleFactor = value;
  }

  /**
   * Highlight the next menu item.
   */
  highlightNext() {
    const { length } = this.sprites.labels;

    if (length) {
      if (this.index < length - 1) {
        this.setIndex(this.index + 1);
      } else {
        this.setIndex(0);
      }
    }
  }

  /**
   * Highlight the previous menu item.
   */
  highlightPrevious() {
    const { length } = this.sprites.labels;

    if (length) {
      if (this.index > 0) {
        this.setIndex(this.index - 1);
      } else {
        this.setIndex(length - 1);
      }
    }
  }

  /**
   * Set the index.
   */
  setIndex(index) {
    const { labels } = this.sprites;

    labels.forEach((child, i) => {
      child.tint = index === i ? RED : WHITE;
    });

    this.index = index;
  }

  /**
   * Play the container. This has the opposite effect of regular container.
   */
  play() {
    super.stop();
  }

  /**
   * Stop the container. This has the opposite effect of regular container.
   */
  stop() {
    super.play();
  }
}

export default MenuContainer;
