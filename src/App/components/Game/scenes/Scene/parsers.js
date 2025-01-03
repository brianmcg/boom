import { GAME_FONT } from '@constants/assets';
import { FONT_SIZES } from '@constants/fonts';
import { RED, BLACK } from '@constants/colors';
import { SCREEN } from '@constants/config';
import SceneCreator from './util/SceneCreator';

const createPromptSprite = text =>
  SceneCreator.createTextSprite({
    fontFamily: GAME_FONT.NAME,
    fontSize: FONT_SIZES.SMALL,
    text,
    color: RED,
    anchor: 0.5,
  });

const createMenuSprites = (menu, textures, animations) => {
  const background = SceneCreator.createRectangleSprite({
    width: SCREEN.WIDTH * 1.5,
    height: SCREEN.HEIGHT * 1.5,
    color: BLACK,
    alpha: 0.75,
  });

  const labels = Object.entries(menu).reduce(
    (memo, [key, value]) => ({
      ...memo,
      [key]: SceneCreator.createTextSprite({
        fontFamily: GAME_FONT.NAME,
        fontSize: FONT_SIZES.SMALL,
        text: value,
        anchor: [0, 0.5],
      }),
    }),
    {}
  );

  const icon = SceneCreator.createMenuIconSprite({
    textures: animations.skull.map(image => textures[image]),
    size: Object.values(labels)[0].height,
  });

  return { icon, labels, background };
};

export const parse = ({ graphics, text }) => {
  const { data, textures } = graphics;
  const { animations } = data;

  return {
    sprites: {
      menu: createMenuSprites(text.menu, textures, animations),
      prompt: createPromptSprite(text.prompt),
    },
  };
};
