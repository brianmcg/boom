import { Container } from 'game/core/graphics';
import { formatMS } from 'game/core/date';
import { SCREEN, TIME_STEP } from 'game/constants/config';

const TEXT_PADDING = SCREEN.HEIGHT / 40;

const INTERVAL = 400;

const MAX_ALPHA = 0.7;

const STATES = {
  SHOW_TITLE: 'review:show:title',
  SHOW_ENEMIES: 'review:show:enemies',
  SHOW_ITEMS: 'review:show:items',
  SHOW_TIME: 'review:show:time',
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

    title.y = (title.height / 2) + TEXT_PADDING * 4;

    title.setScale(0);

    [enemies, items, time].forEach(({ name, value }, i) => {
      name.y = statsStartY + (i * ((TEXT_PADDING * 2) + statsHeight));
      value.y = statsStartY + (i * ((TEXT_PADDING * 2) + statsHeight));
    });

    this.timer = 0;
    this.currentIndex = 0;
    this.sprites = sprites;

    background.alpha = 0;
    this.addChild(background);

    this.on('added', this.setShowTitle.bind(this));
  }

  /**
   * Updates the containner.
   * @param  {Number} delta the delta time.
   */
  update(delta) {
    switch (this.state) {
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
      default:
        break;
    }
  }

  /**
   * Update the pause effect.
   * @param  {Number} value The value of the effect.
   */
  updateFadeEffect(value) {
    super.updateFadeEffect(1 - value);
    this.fadeEffect = value;
  }

  /**
   * Animate the container.
   */
  animate() {
    this.sprites.background.alpha = this.fadeEffect * MAX_ALPHA;
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

    title.x = SCREEN.WIDTH / 2;

    time.value.text = formatMS(timeTaken);
    enemies.value.text = `${Math.round(enemiesKilled / enemiesTotal * 100)}%`;
    items.value.text = `${Math.round(itemsFound / itemsTotal * 100)}%`;

    [enemies, items, time].forEach(({ name, value }) => {
      name.x = (SCREEN.WIDTH / 2) - (name.width / 2) - TEXT_PADDING;
      value.x = (SCREEN.WIDTH / 2) + (value.width / 2) + TEXT_PADDING;
    });
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
}

export default ReviewContainer;
