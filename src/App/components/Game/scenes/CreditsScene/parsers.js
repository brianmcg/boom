import { SCREEN } from '@constants/config';
import { GAME_FONT } from '@constants/assets';
import { FONT_SIZES } from '@constants/fonts';
import { RED, WHITE, BLACK } from '@constants/colors';
import CreditsSceneCreator from './util/CreditsSceneCreator';

export const parse = ({ graphics, text }) => {
  const { textures } = graphics;

  const logo = CreditsSceneCreator.createFadeSprite({ texture: textures.logo });

  const credits = text.credits.reduce((memo, credit) => {
    const key = CreditsSceneCreator.createTextSprite({
      fontFamily: GAME_FONT.NAME,
      fontSize: FONT_SIZES.SMALL,
      text: credit.key,
      color: RED,
      anchor: 0.5,
    });

    const values = credit.values.map(value =>
      CreditsSceneCreator.createTextSprite({
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

  const end = CreditsSceneCreator.createTextSprite({
    fontFamily: GAME_FONT.NAME,
    fontSize: FONT_SIZES.LARGE,
    text: text.end,
    color: WHITE,
    anchor: 0.5,
  });

  const background = CreditsSceneCreator.createRectangleSprite({
    width: SCREEN.WIDTH,
    height: SCREEN.HEIGHT,
    color: BLACK,
  });

  return {
    sprites: {
      background,
      scroll: {
        logo,
        credits,
        end,
      },
    },
  };
};
