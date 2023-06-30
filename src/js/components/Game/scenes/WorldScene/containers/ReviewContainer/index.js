import { Container } from '@game/core/graphics';
import { SCREEN } from '@game/constants/config';
import StatContainer from './containers/StatContainer';

const TEXT_PADDING = SCREEN.HEIGHT / 40;

const MAX_ALPHA = 0.7;

const INTERVAL = 500;

const EVENTS = {
  SHOW_STAT: 'review:show:stat',
};

const formatMS = (ms) => {
  let seconds = parseInt((ms / 1000) % 60, 10);
  let minutes = parseInt((ms / (1000 * 60)) % 60, 10);
  let hours = parseInt((ms / (1000 * 60 * 60)) % 24, 10);

  hours = (hours < 10) ? `0${hours}` : hours;
  minutes = (minutes < 10) ? `0${minutes}` : minutes;
  seconds = (seconds < 10) ? `0${seconds}` : seconds;

  return `${hours}:${minutes}:${seconds}`;
};

const isNumber = value => !Number.isNaN(Number(value));

const formatPercent = (achieved, total) => {
  const percent = Math.round(achieved / total * 100);

  return isNumber(percent) ? `${percent}%` : '-';
};

/**
 * Class representing a review container.
 */
class ReviewContainer extends Container {
  /**
   * Creates a review container.
   * @param  {Object} sprites   The sprites for the container.
   */
  constructor(sprites, sounds) {
    super();

    const { title, stats, background } = sprites;
    const statsHeight = stats.enemies.name.height;
    const statsStartY = title.height + (TEXT_PADDING * 10);

    this.statContainers = Object.values(stats).reduce((memo, { name, value }, i) => [
      ...memo,
      new StatContainer({
        sprites: [name, value],
        y: statsStartY + (i * ((TEXT_PADDING * 2) + statsHeight)),
        sound: sounds.pause,
      }),
    ], [
      new StatContainer({
        sprites: [title],
        y: (title.height / 2) + TEXT_PADDING * 4,
        sound: sounds.complete,
      }),
    ]);

    this.timer = 0;
    this.currentIndex = 0;
    this.sprites = sprites;

    this.addChild(background);

    this.on('added', () => this.showNext());
  }

  /**
   * Add a callback for the show stat event.
   * @param  {Function} callback The callback function.
   */
  onShowStat(callback) {
    this.on(EVENTS.SHOW_STAT, callback);
  }

  /**
   * Emit the show stat event.
   * @param {String} sound  The sound to play.
   */
  emitShowStat(sound) {
    this.emit(EVENTS.SHOW_STAT, sound);
  }

  /**
   * Updates the containner.
   * @param  {Number} delta the delta time.
   */
  update(delta, elapsedMS) {
    super.update(delta, elapsedMS);

    this.sprites.background.alpha = this.alphaFactor;

    if (this.currentIndex === this.statContainers.length) {
      this.timer += elapsedMS;

      if (this.timer >= INTERVAL) {
        this.stop();
        this.parent.setPrompting();
      }
    }
  }

  /**
   * Update the pause effect.
   * @param  {Number} value The value of the effect.
   */
  fade(value) {
    super.fade(1 - value);
    this.alphaFactor = value * MAX_ALPHA;
  }

  /**
   * Show the next stat.
   * @return {[type]} [description]
   */
  showNext() {
    const next = this.statContainers[this.currentIndex];

    if (next) {
      this.addChild(next);
      this.currentIndex += 1;
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
    secretsFound,
    secretsTotal,
    timeTaken,
  }) {
    const { title, stats } = this.sprites;

    const {
      enemies,
      items,
      secrets,
      time,
    } = stats;

    title.x = SCREEN.WIDTH / 2;

    time.value.text = formatMS(timeTaken);
    enemies.value.text = formatPercent(enemiesKilled, enemiesTotal);
    items.value.text = formatPercent(itemsFound, itemsTotal);
    secrets.value.text = formatPercent(secretsFound, secretsTotal);

    [enemies, items, secrets, time].forEach(({ name, value }) => {
      name.x = (SCREEN.WIDTH / 2) - (name.width / 2) - TEXT_PADDING;
      value.x = (SCREEN.WIDTH / 2) + (value.width / 2) + TEXT_PADDING;
    });
  }
}

export default ReviewContainer;
