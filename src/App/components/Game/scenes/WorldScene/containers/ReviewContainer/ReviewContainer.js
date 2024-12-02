import { Container } from '@game/core/graphics';
import { SCREEN, SCREEN_PADDING } from '@constants/config';
import StatContainer from './containers/StatContainer';

const TEXT_PADDING = SCREEN_PADDING / 2;

const MAX_ALPHA = 0.7;

const INTERVAL = 500;

const EVENTS = {
  SHOW_STAT: 'review:show:stat',
};

const formatMS = ms => {
  let seconds = parseInt((ms / 1000) % 60, 10);
  let minutes = parseInt((ms / (1000 * 60)) % 60, 10);
  let hours = parseInt((ms / (1000 * 60 * 60)) % 24, 10);

  hours = hours < 10 ? `0${hours}` : hours;
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  seconds = seconds < 10 ? `0${seconds}` : seconds;

  return `${hours}:${minutes}:${seconds}`;
};

const isNumber = value => !Number.isNaN(Number(value));

const formatPercent = (achieved, total) => {
  const percent = Math.round((achieved / total) * 100);

  return isNumber(percent) ? `${percent}%` : '-';
};

export default class ReviewContainer extends Container {
  constructor(sprites, sounds) {
    super();

    const { title, stats, background } = sprites;
    const statsHeight = stats.enemies.name.height;

    this.statContainers = Object.values(stats).reduce(
      (memo, { name, value }, i) => [
        ...memo,
        new StatContainer({
          sprites: [name, value],
          y:
            title.y +
            title.height / 2 +
            SCREEN_PADDING +
            TEXT_PADDING +
            i * (TEXT_PADDING * 2 + statsHeight),
          sound: sounds.pause,
        }),
      ],
      [
        new StatContainer({
          sprites: [title],
          y: title.height / 2 + SCREEN_PADDING,
          sound: sounds.complete,
        }),
      ]
    );

    this.timer = 0;
    this.currentIndex = 0;
    this.sprites = sprites;

    this.addChild(background);

    this.on('added', () => this.showNext());
  }

  onShowStat(callback) {
    this.on(EVENTS.SHOW_STAT, callback);
  }

  emitShowStat(sound) {
    this.emit(EVENTS.SHOW_STAT, sound);
  }

  update(ticker) {
    super.update(ticker);

    this.sprites.background.alpha = this.alphaFactor;

    if (this.currentIndex === this.statContainers.length) {
      this.timer += ticker.elapsedMS;

      if (this.timer >= INTERVAL) {
        this.stop();
        this.parent.setPrompting();
      }
    }
  }

  fade(value) {
    super.fade(1 - value);
    this.alphaFactor = value * MAX_ALPHA;
  }

  showNext() {
    const next = this.statContainers[this.currentIndex];

    if (next) {
      this.addChild(next);
      this.currentIndex += 1;
    }
  }

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

    const { enemies, items, secrets, time } = stats;

    title.x = SCREEN.WIDTH / 2;

    time.value.text = formatMS(timeTaken);
    enemies.value.text = formatPercent(enemiesKilled, enemiesTotal);
    items.value.text = formatPercent(itemsFound, itemsTotal);
    secrets.value.text = formatPercent(secretsFound, secretsTotal);

    [enemies, items, secrets, time].forEach(({ name, value }) => {
      name.x = SCREEN.WIDTH / 2 - name.width / 2 - TEXT_PADDING;
      value.x = SCREEN.WIDTH / 2 + value.width / 2 + TEXT_PADDING;
    });
  }

  destroy(options) {
    this.statContainers.forEach(container => {
      this.removeChild(container);
      container.destroy(options);
    });

    super.destroy(options);
  }
}
