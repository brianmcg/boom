import { Container, RectangleSprite, TextSprite } from '~/core/graphics';
import { SCREEN, TIME_STEP } from '~/constants/config';
import { BLACK, WHITE, RED } from '~/constants/colors';
import { FONT_SIZES } from '~/constants/fonts';

const TEXT_PADDING = SCREEN.HEIGHT / 40;

const INTERVAL = 1000;

const STATE = {
  SHOW_TITLE: '',
  SHOW_ENEMIES: '',
  SHOW_ITEMS: '',
};

class ReviewContainer extends Container {
  constructor({ onComplete }) {
    super();

    this.onComplete = onComplete;

    this.addChild(new RectangleSprite({
      width: SCREEN.WIDTH,
      height: SCREEN.HEIGHT,
      color: BLACK,
      alpha: 0.8,
    }));

    this.title = new TextSprite({
      font: FONT_SIZES.LARGE,
      text: 'Level Complete',
      color: WHITE,
    });

    this.title.x = (SCREEN.WIDTH / 2) - (this.title.width / 2);

    this.title.y = TEXT_PADDING;

    this.addChild(this.title);

    this.stats = [{
      name: new TextSprite({
        font: FONT_SIZES.SMALL,
        text: 'Enemies Killed',
        color: WHITE,
      }),
      value: new TextSprite({
        font: FONT_SIZES.SMALL,
        text: '0 out of 10',
        color: RED,
      }),
    }, {
      name: new TextSprite({
        font: FONT_SIZES.SMALL,
        text: 'Items Found',
        color: WHITE,
      }),
      value: new TextSprite({
        font: FONT_SIZES.SMALL,
        text: '0 out of 10',
        color: RED,
      }),
    }, {
      name: new TextSprite({
        font: FONT_SIZES.SMALL,
        text: 'Time Taken',
        color: WHITE,
      }),
      value: new TextSprite({
        font: FONT_SIZES.SMALL,
        text: '0 minutes',
        color: RED,
      }),
    }];

    const statsStartY = this.title.y + this.title.height + (TEXT_PADDING * 4);
    const statsHeight = this.stats[0].name.height;

    this.stats.forEach(({ name, value }, i) => {
      name.x = (SCREEN.WIDTH / 2) - TEXT_PADDING - name.width;
      name.y = statsStartY + (i * ((TEXT_PADDING * 2) + statsHeight));
      value.x = (SCREEN.WIDTH / 2) + TEXT_PADDING;
      value.y = statsStartY + (i * ((TEXT_PADDING * 2) + statsHeight));
    });

    this.timer = 0;
    this.currentIndex = 0;
  }

  update(delta) {
    this.timer += delta * TIME_STEP;

    if (this.timer > INTERVAL) {
      const stat = this.stats[this.currentIndex];

      if (stat) {
        this.addChild(stat.name);
        this.addChild(stat.value);
      } else {
        this.onComplete();
      }

      this.timer = 0;
      this.currentIndex += 1;
    }
  }

  // setStats({ enemiesKilled, itemsFound, timeTake }) {

  // }
}

export default ReviewContainer;
