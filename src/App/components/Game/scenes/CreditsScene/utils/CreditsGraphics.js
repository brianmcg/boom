import { SCREEN } from '@constants/config';
import { GAME_FONT } from '@constants/assets';
import { FONT_SIZES } from '@constants/fonts';
import { RED, WHITE, BLACK } from '@constants/colors';
import { GraphicsCache } from '@game/core/graphics';
import { SceneGraphics } from '../../Scene';
import BackgroundContainer from '../containers/BackgroundContainer';
import ScrollContainer from '../containers/ScrollContainer';

export default class CreditsGraphics extends SceneGraphics {
  static createBackgroundContainer(options) {
    const container = new BackgroundContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createScrollContainer(options) {
    const container = new ScrollContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createCreditsSprites({ graphics, text }) {
    const { textures } = graphics;

    const logo = CreditsGraphics.createFadeSprite({
      texture: textures.logo,
    });

    const credits = text.credits.reduce((memo, credit) => {
      const key = CreditsGraphics.createTextSprite({
        fontFamily: GAME_FONT.NAME,
        fontSize: FONT_SIZES.SMALL,
        text: credit.key,
        color: RED,
        anchor: 0.5,
      });

      const values = credit.values.map(value =>
        CreditsGraphics.createTextSprite({
          fontFamily: GAME_FONT.NAME,
          fontSize: FONT_SIZES.SMALL,
          text: value,
          color: WHITE,
          anchor: 0.5,
        })
      );

      memo.push([key, ...values]);

      return memo;
    }, []);

    const end = CreditsGraphics.createTextSprite({
      fontFamily: GAME_FONT.NAME,
      fontSize: FONT_SIZES.LARGE,
      text: text.end,
      color: WHITE,
      anchor: 0.5,
    });

    const background = CreditsGraphics.createRectangleSprite({
      width: SCREEN.WIDTH,
      height: SCREEN.HEIGHT,
      color: BLACK,
    });

    return {
      background,
      scroll: {
        logo,
        credits,
        end,
      },
    };
  }
}
