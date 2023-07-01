import { Container } from '@game/core/graphics';
import { RED, WHITE } from '@game/constants/colors';
import { SCREEN } from '@game/constants/config';

const SCREEN_PADDING = 6;

const ICON_PADDING_RIGHT = 5;

const MAX_ALPHA = 0.7;

const EVENTS = {
  SELECT: 'menu:select',
  CLOSE: 'menu:close',
};

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

    this.on('removed', () => {
      if (this.selectedIndex !== null) {
        this.emit(EVENTS.SELECT, this.selectedIndex);
      } else {
        this.emit(EVENTS.CLOSE);
      }
    });
  }

  /**
   * Add a callback for the select event.
   */
  onSelect(callback) {
    this.on(EVENTS.SELECT, callback);
  }

  /**
   * Add a callback for the select event.
   */
  onClose(callback) {
    this.on(EVENTS.CLOSE, callback);
  }

  /**
   * Update the container.
   */
  update(delta) {
    super.update(delta);

    const { icon, labels, background } = this.sprites;

    icon.scale.set(this.scaleFactor);

    background.alpha = this.alphaFactor;

    labels.forEach((child, i) => {
      child.scale.set(this.scaleFactor);

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
   * Select an option.
   */
  select() {
    this.selectedIndex = this.index;
  }

  /**
   * Set the index.
   */
  setIndex(index) {
    const { labels } = this.sprites;

    labels.forEach((child, i) => {
      child.tint = index === i ? RED : WHITE;
    });

    this.selectedIndex = null;
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

  /**
   * Pause the container. This has the opposite effect of regular container.
   */
  pause() {
    super.play();
  }
}

export default MenuContainer;
