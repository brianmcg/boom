import { Container } from 'game/core/graphics';
import { formatMS } from 'game/core/date';
import { SCREEN, TIME_STEP } from 'game/constants/config';

const TEXT_PADDING = SCREEN.HEIGHT / 40;

const INTERVAL = 400;

const FADE_INCREMENT = 0.05;

const MAX_ALPHA = 0.7;

const STATES = {
  FADING_IN: 'review:fading:in',
  SHOW_TITLE: 'review:show:title',
  SHOW_ENEMIES: 'review:show:enemies',
  SHOW_ITEMS: 'review:show:items',
  SHOW_TIME: 'review:show:time',
  FADING_OUT: 'review:fading:out',
};

/**
 * Class representing a review container.
 */
class ReviewContainer extends Container {
  /**
   * Creates a review container.
   * @param  {Object} sprites   The sprites for the container.
   */
  constructor(sprites) {
    super();

    const { title, stats, background } = sprites;
    const { enemies, items, time } = stats;
    const statsHeight = stats.enemies.name.height;
    const statsStartY = title.height + (TEXT_PADDING * 8);

    title.y = TEXT_PADDING * 4;

    [enemies, items, time].forEach(({ name, value }, i) => {
      name.y = statsStartY + (i * ((TEXT_PADDING * 2) + statsHeight));
      value.y = statsStartY + (i * ((TEXT_PADDING * 2) + statsHeight));
    });

    this.timer = 0;
    this.currentIndex = 0;
    this.sprites = sprites;

    this.addChild(background);

    this.on('added', this.setFadingIn.bind(this));
  }

  /**
   * Updates the containner.
   * @param  {Number} delta the delta time.
   */
  update(delta) {
    switch (this.state) {
      case STATES.FADING_IN:
        this.updateFadingIn(delta);
        break;
      case STATES.SHOW_TITLE:
        this.updateShowTitle(delta);
        break;
      case STATES.SHOW_ENEMIES:
        this.updateShowEnemies(delta);
        break;
      case STATES.SHOW_ITEMS:
        this.updateShowItems(delta);
        break;
      case STATES.SHOW_TIME:
        this.updateShowTime(delta);
        break;
      case STATES.FADING_OUT:
        this.updateFadingOut(delta);
        break;
      default:
        break;
    }
  }

  /**
   * Animate the container.
   */
  animate() {
    this.sprites.background.alpha = this.fade * MAX_ALPHA;
  }

  updateFadingIn(delta) {
    this.fade += FADE_INCREMENT * delta;

    if (this.fade >= 1) {
      this.fade = 1;
      this.setShowTitle();
    }
  }

  updateFadingOut(delta) {
    this.fade -= FADE_INCREMENT * delta;

    if (this.fade <= 0) {
      this.fade = 0;
      // this.parent.setPrompting();
    }
  }

  setFadingIn() {
    const stateChange = this.setState(STATES.FADING_IN);

    if (stateChange) {
      this.fade = 0;
      this.sprites.background.alpha = 0;
    }

    return stateChange;
  }

  setFadingOut() {
    const stateChange = this.setState(STATES.FADING_OUT);

    if (stateChange) {
      const { title, stats } = this.sprites;

      this.removeChild(title);

      Object.values(stats).forEach(({ name, value }) => {
        this.removeChild(name);
        this.removeChild(value);
      });
    }

    return stateChange;
  }

  /**
   * Update the container when in the show title state.
   * @param  {Number} delta The delta time.
   */
  updateShowTitle(delta) {
    this.timer += TIME_STEP * delta;

    if (this.timer >= INTERVAL) {
      this.timer = 0;
      this.setShowEnemies();
    }
  }

  /**
   * Update the container when in the show enemies state.
   * @param  {Number} delta The delta time.
   */
  updateShowEnemies(delta) {
    this.timer += TIME_STEP * delta;

    if (this.timer >= INTERVAL) {
      this.timer = 0;
      this.setShowItems();
    }
  }

  /**
   * Update the container when in the show items state.
   * @param  {Number} delta The delta time.
   */
  updateShowItems(delta) {
    this.timer += TIME_STEP * delta;

    if (this.timer >= INTERVAL) {
      this.timer = 0;
      this.setShowTime();
    }
  }

  /**
   * Update the container when in the show time state.
   * @param  {Number} delta The delta time.
   */
  updateShowTime(delta) {
    this.timer += TIME_STEP * delta;

    if (this.timer >= INTERVAL) {
      this.timer = 0;
      this.parent.playSound(this.parent.sounds.complete);
      this.parent.setPrompting();
    }
  }

  /**
   * Set the state to show title.
   */
  setShowTitle() {
    if (this.setState(STATES.SHOW_TITLE)) {
      this.parent.playSound(this.parent.sounds.complete);
      this.addChild(this.sprites.title);
    }
  }

  /**
   * Set the state to show enemies.
   */
  setShowEnemies() {
    const { name, value } = this.sprites.stats.enemies;

    if (this.setState(STATES.SHOW_ENEMIES)) {
      this.parent.playSound(this.parent.sounds.pause);
      this.addChild(name);
      this.addChild(value);
    }
  }

  /**
   * Set the state to show items.
   */
  setShowItems() {
    const { name, value } = this.sprites.stats.items;

    if (this.setState(STATES.SHOW_ITEMS)) {
      this.parent.playSound(this.parent.sounds.pause);
      this.addChild(name);
      this.addChild(value);
    }
  }

  /**
   * Set the state to show time.
   */
  setShowTime() {
    const { name, value } = this.sprites.stats.time;

    if (this.setState(STATES.SHOW_TIME)) {
      this.parent.playSound(this.parent.sounds.pause);
      this.addChild(name);
      this.addChild(value);
    }
  }

  /**
   * Set the container state.
   * @param {String} state The container state to set.
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;

      return true;
    }

    return false;
  }

  /**
   * Set the statistics text.
   * @param {Number} options.enemiesKilled The number of enemies killed.
   * @param {Number} options.enemiesTotal  The total number of enemies.
   * @param {Number} options.itemsFound    The number of items found.
   * @param {Number} options.itemsTotal    The total number of items.
   * @param {Number} options.timeTaken     The time since the world was created.
   */
  setStatistics({
    enemiesKilled,
    enemiesTotal,
    itemsFound,
    itemsTotal,
    timeTaken,
  }) {
    const { title, stats } = this.sprites;
    const { enemies, items, time } = stats;

    title.x = (SCREEN.WIDTH / 2) - (title.width / 2);

    time.value.text = formatMS(timeTaken);
    enemies.value.text = `${Math.round(enemiesKilled / enemiesTotal * 100)}%`;
    items.value.text = `${Math.round(itemsFound / itemsTotal * 100)}%`;

    [enemies, items, time].forEach(({ name, value }) => {
      name.x = (SCREEN.WIDTH / 2) - TEXT_PADDING - name.width;
      value.x = (SCREEN.WIDTH / 2) + TEXT_PADDING;
    });
  }
}

export default ReviewContainer;
