import { Container } from 'game/core/graphics';
import { formatMS } from 'game/core/date';
import { SCREEN } from 'game/constants/config';

const TEXT_PADDING = SCREEN.HEIGHT / 40;

const INTERVAL = 200;

const MAX_ALPHA = 0.7;

const SCALE_INCREMENT = 0.1;

const SHOW_STAT_EVENT = 'review:container:show:stat';

const STATES = {
  SHOW_TITLE: 'review:show:title',
  SHOW_ENEMIES: 'review:show:enemies',
  SHOW_ITEMS: 'review:show:items',
  SHOW_TIME: 'review:show:time',
  REMOVE_STATS: 'review:remove:stats',
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
    const statsStartY = title.height + (TEXT_PADDING * 10);

    title.y = (title.height / 2) + TEXT_PADDING * 4;

    [enemies, items, time].forEach(({ name, value }, i) => {
      name.y = statsStartY + (i * ((TEXT_PADDING * 2) + statsHeight));
      value.y = statsStartY + (i * ((TEXT_PADDING * 2) + statsHeight));
    });

    this.timer = 0;
    this.titleScale = 0;
    this.enemiesScale = 0;
    this.itemsScale = 0;
    this.timeScale = 0;

    this.sprites = sprites;

    this.addChild(background);
  }

  /**
   * Add a callback for the show stat event.
   * @param  {Function} callback The callback function.
   */
  onShowStat(callback) {
    this.on(SHOW_STAT_EVENT, callback);
  }

  /**
   * Updates the containner.
   * @param  {Number} delta the delta time.
   */
  update(delta, elapsedMS) {
    switch (this.state) {
      case STATES.SHOW_TITLE:
        this.updateShowTitle(delta, elapsedMS);
        break;
      case STATES.SHOW_ENEMIES:
        this.updateShowEnemies(delta, elapsedMS);
        break;
      case STATES.SHOW_ITEMS:
        this.updateShowItems(delta, elapsedMS);
        break;
      case STATES.SHOW_TIME:
        this.updateShowTime(delta, elapsedMS);
        break;
      case STATES.REMOVE_STATS:
        this.updateRemoveStats(delta);
        break;
      default:
        break;
    }

    const { background, title, stats } = this.sprites;

    background.alpha = this.alphaFactor;

    title.setScale(this.titleScale);

    Object.values(stats.enemies).forEach(sprite => sprite.setScale(this.enemiesScale));
    Object.values(stats.items).forEach(sprite => sprite.setScale(this.itemsScale));
    Object.values(stats.time).forEach(sprite => sprite.setScale(this.timeScale));
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
   * Update the container when in the show title state.
   * @param  {Number} delta The delta time.
   */
  updateShowTitle(delta, elapsedMS) {
    this.titleScale += SCALE_INCREMENT * delta;

    if (this.titleScale >= 1) {
      this.titleScale = 1;

      this.timer += elapsedMS;

      if (this.timer >= INTERVAL) {
        this.timer = 0;
        this.setShowEnemies();
      }
    }
  }

  /**
   * Update the container when in the show enemies state.
   * @param  {Number} delta The delta time.
   */
  updateShowEnemies(delta, elapsedMS) {
    this.enemiesScale += SCALE_INCREMENT * delta;

    if (this.enemiesScale >= 1) {
      this.enemiesScale = 1;

      this.timer += elapsedMS;

      if (this.timer >= INTERVAL) {
        this.timer = 0;
        this.setShowItems();
      }
    }
  }

  /**
   * Update the container when in the show items state.
   * @param  {Number} delta The delta time.
   */
  updateShowItems(delta, elapsedMS) {
    this.itemsScale += SCALE_INCREMENT * delta;

    if (this.itemsScale >= 1) {
      this.itemsScale = 1;

      this.timer += elapsedMS;

      if (this.timer >= INTERVAL) {
        this.timer = 0;
        this.setShowTime();
      }
    }
  }

  /**
   * Update the container when in the show time state.
   * @param  {Number} delta The delta time.
   */
  updateShowTime(delta, elapsedMS) {
    this.timeScale += SCALE_INCREMENT * delta;

    if (this.timeScale >= 1) {
      this.timeScale = 1;

      this.timer += elapsedMS;

      if (this.timer >= INTERVAL) {
        this.timer = 0;
        this.parent.setPrompting();
      }
    }
  }

  /**
   * Update in the remove stats state.
   */
  updateRemoveStats() {
    this.titleScale = this.scaleFactor;
    this.enemiesScale = this.scaleFactor;
    this.itemsScale = this.scaleFactor;
    this.timeScale = this.scaleFactor;
  }

  /**
   * Set the state to show title.
   */
  setShowTitle() {
    if (this.setState(STATES.SHOW_TITLE)) {
      this.sprites.title.setScale(0);
      this.addChild(this.sprites.title);
    }
  }

  /**
   * Set the state to show enemies.
   */
  setShowEnemies() {
    const isStateChanged = this.setState(STATES.SHOW_ENEMIES);

    if (isStateChanged) {
      this.emit(SHOW_STAT_EVENT);

      Object.values(this.sprites.stats.enemies).forEach((sprite) => {
        sprite.setScale(0);
        this.addChild(sprite);
      });
    }

    return isStateChanged;
  }

  /**
   * Set the state to show items.
   */
  setShowItems() {
    const isStateChanged = this.setState(STATES.SHOW_ITEMS);

    if (isStateChanged) {
      this.emit(SHOW_STAT_EVENT);

      Object.values(this.sprites.stats.items).forEach((sprite) => {
        sprite.setScale(0);
        this.addChild(sprite);
      });
    }

    return isStateChanged;
  }

  /**
   * Set the state to show time.
   */
  setShowTime() {
    const isStateChanged = this.setState(STATES.SHOW_TIME);

    if (isStateChanged) {
      this.emit(SHOW_STAT_EVENT);

      Object.values(this.sprites.stats.time).forEach((sprite) => {
        sprite.setScale(0);
        this.addChild(sprite);
      });
    }

    return isStateChanged;
  }

  /**
   * Set to the remove stats state.
   */
  setRemoveStats() {
    return this.setState(STATES.REMOVE_STATS);
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
}

export default ReviewContainer;
