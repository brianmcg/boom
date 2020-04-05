import { Container } from 'game/core/graphics';
import { RED, WHITE } from 'game/constants/colors';
import { SCREEN } from 'game/constants/config';

const SCREEN_PADDING = 6;

const ICON_PADDING_RIGHT = 5;

const FADE_INCREMENT = 0.1;

const MAX_ALPHA = 0.7;

const SCALE_INCREMENT = 0.1;

const STATES = {
  FADING_IN: 'menu:fading:in',
  GROWING: 'menu:growing',
  SHRINKING: 'menu:shrinking',
  FADING_OUT: 'menu:fading:out',
};

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

    const { icon, labels } = this.sprites;

    this.currentIndex = 0;
    this.items = items;

    this.addChild(sprites.background);

    if (this.items.length) {
      this.addChild(icon);
    }

    this.items.forEach((item, index) => {
      const sprite = labels[item.label];
      const totalHeight = (sprite.height + SCREEN_PADDING) * this.items.length;

      sprite.x = (SCREEN.WIDTH / 2);
      sprite.y = ((SCREEN.HEIGHT / 2) - (totalHeight / 2))
        + (index * sprite.height)
        + (index * SCREEN_PADDING);

      this.addChild(sprite);
    });

    this.on('added', this.setFadingIn.bind(this));
  }

  /**
   * Update the menu container.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    super.update(delta);

    switch (this.state) {
      case STATES.FADING_IN:
        this.updateFadingIn(delta);
        break;
      case STATES.GROWING:
        this.updateGrowing(delta);
        break;
      case STATES.SHRINKING:
        this.updateShrinking(delta);
        break;
      case STATES.FADING_OUT:
        this.updateFadingOut(delta);
        break;
      default:
        break;
    }
  }

  /**
   * Update in the fading in state.
   * @param  {Number} delta The delta time.
   */
  updateFadingIn(delta) {
    this.fade += FADE_INCREMENT * delta;

    if (this.fade >= 1) {
      this.fade = 1;
      this.setGrowing();
    }
  }

  /**
   * Update in the growing state.
   * @param  {Number} delta The delta time.
   */
  updateGrowing(delta) {
    this.scaleFactor += delta * SCALE_INCREMENT;

    if (this.scaleFactor >= 1) {
      this.scaleFactor = 1;

      this.setState(null);
    }
  }

  /**
   * Update in the shrinking state.
   * @param  {Number} delta The delta time.
   */
  updateShrinking(delta) {
    this.scaleFactor -= delta * SCALE_INCREMENT;

    if (this.scaleFactor <= 0) {
      this.scaleFactor = 0;

      this.setFadingOut();
    }
  }

  /**
   * Update in the fading out state.
   * @param  {Number} delta The delta time.
   */
  updateFadingOut(delta) {
    this.fade -= FADE_INCREMENT * delta;

    if (this.fade <= 0) {
      this.fade = 0;
      this.parent.setRunning();
      this.parent.removeChild(this);

      if (this.selectedOption) {
        this.selectedOption();
      }
    }
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
  select() {
    if (this.items.length) {
      this.selectedOption = this.items[this.currentIndex].onSelect;
      this.setShrinking();
    }
  }

  /**
   * Animate the container.
   */
  animate() {
    const { icon, labels, background } = this.sprites;

    icon.setScale(this.scaleFactor);
    background.alpha = this.fade * MAX_ALPHA;

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
   * Set to the fading in state.
   */
  setFadingIn() {
    const stateChange = this.setState(STATES.FADING_IN);

    if (stateChange) {
      this.selectedOption = null;
      this.currentIndex = 0;
      this.fade = 0;
      this.scaleFactor = 0;
    }

    return stateChange;
  }

  /**
   * Set to the fading out state.
   */
  setFadingOut() {
    return this.setState(STATES.FADING_OUT);
  }

  /**
   * Set to the growing state.
   */
  setGrowing() {
    return this.setState(STATES.GROWING);
  }

  /**
   * Set to the shrinking state.
   */
  setShrinking() {
    return this.setState(STATES.SHRINKING);
  }

  /**
   * Set the state.
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

export default MenuContainer;
