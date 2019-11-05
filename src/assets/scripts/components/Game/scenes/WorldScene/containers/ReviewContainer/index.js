import { Container } from '~/core/graphics';
import { SCREEN, TIME_STEP } from '~/constants/config';

const TEXT_PADDING = SCREEN.HEIGHT / 40;

const INTERVAL = 1000;

const STATES = {
  SHOW_TITLE: 'show:title',
  SHOW_ENEMIES: 'show:enemies',
  SHOW_ITEMS: 'show:items',
  SHOW_TIME: 'show:time',
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

    this.addChild(sprites.background);

    const { title, stats } = sprites;
    const statsStartY = title.y + title.height + (TEXT_PADDING * 4);
    const statsHeight = stats.enemies.name.height;

    title.x = (SCREEN.WIDTH / 2) - (title.width / 2);
    title.y = TEXT_PADDING * 2;

    Object.values(stats).forEach(({ name, value }, i) => {
      name.x = (SCREEN.WIDTH / 2) - TEXT_PADDING - name.width;
      name.y = statsStartY + (i * ((TEXT_PADDING * 2) + statsHeight));
      value.x = (SCREEN.WIDTH / 2) + TEXT_PADDING;
      value.y = statsStartY + (i * ((TEXT_PADDING * 2) + statsHeight));
    });

    this.timer = 0;
    this.currentIndex = 0;
    this.sprites = sprites;

    this.setShowTitle();
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
      this.parent.setPrompting();
      this.setState(null);
    }
  }

  /**
   * Set the state to show title.
   */
  setShowTitle() {
    if (this.setState(STATES.SHOW_TITLE)) {
      this.addChild(this.sprites.title);
    }
  }

  /**
   * Set the state to show enemies.
   */
  setShowEnemies() {
    const { name, value } = this.sprites.stats.enemies;

    if (this.setState(STATES.SHOW_ENEMIES)) {
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
      this.addChild(name);
      this.addChild(value);
    }
  }

  setHideText() {
    const { title, stats } = this.sprites;

    this.removeChild(title);

    Object.values(stats).forEach(({ name, value }) => {
      this.removeChild(name);
      this.removeChild(value);
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

  // setStats({ enemiesKilled, itemsFound, timeTake }) {

  // }
}

export default ReviewContainer;
