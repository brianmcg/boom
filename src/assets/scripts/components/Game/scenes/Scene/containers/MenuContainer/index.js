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
   * @param  {Object} options.sprites The sprites.
   * @param  {Array}  options.items   The menu items.
   */
  constructor({ sprites, items }) {
    super();

    this.sprites = sprites;

    const { icon, labels, background } = this.sprites;

    this.items = items;
    this.scaleFactor = 0;
    this.alphaFactor = 0;
    this.selectedOption = null;

    this.addChild(background);

    if (this.items.length) {
      this.addChild(icon);
    }

    this.items.forEach((item, index) => {
      const sprite = labels[item.label];
      const totalHeight = (sprite.height + SCREEN_PADDING) * this.items.length;

      sprite.x = (SCREEN.WIDTH / 2);
      sprite.y = ((SCREEN.HEIGHT / 2) - (totalHeight / 2))
        + (index * sprite.height) + (index * SCREEN_PADDING);

      this.addChild(sprite);
    });

    this.on('added', () => {
      this.currentIndex = 0;
    });
  }

  /**
   * Highlight the next menu item.
   */
  highlightNext() {
    if (this.items.length) {
      if (this.currentIndex < this.items.length - 1) {
        this.currentIndex += 1;
      } else {
        this.currentIndex = 0;
      }
    }
  }

  /**
   * Highlight the previous menu item.
   */
  highlightPrevious() {
    if (this.items.length) {
      if (this.currentIndex > 0) {
        this.currentIndex -= 1;
      } else {
        this.currentIndex = this.items.length - 1;
      }
    }
  }

  /**
   * Select the current menu item.
   */
  getHighlightedOption() {
    if (this.items.length) {
      return this.items[this.currentIndex].onSelect;
    }

    return null;
  }

  /**
   * Update the pause effect.
   * @param  {Number} value The value of the effect.
   */
  updateFadeEffect(value) {
    this.alphaFactor = value * MAX_ALPHA;
    this.scaleFactor = value;
  }

  /**
   * Animate the container.
   */
  update() {
    const { icon, labels, background } = this.sprites;

    icon.setScale(this.scaleFactor);
    background.alpha = this.alphaFactor;

    Object.values(labels).forEach((child, index) => {
      child.setScale(this.scaleFactor);

      if (index === this.currentIndex) {
        icon.y = child.y;
        icon.x = child.x - (child.width / 2) - ICON_PADDING_RIGHT - (icon.width / 2);
        child.tint = RED;
      } else {
        child.tint = WHITE;
      }
    });
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
