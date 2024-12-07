import { TextSprite, GraphicsCreator } from '@game/core/graphics';
import { GAME_FONT } from '@constants/assets';
import { FONT_SIZES } from '@constants/fonts';
import { RED, BLACK } from '@constants/colors';
import { SCREEN } from '@constants/config';
import MenuIconSprite from './sprites/MenuIconSprite';

const createPromptSprite = text =>
  new TextSprite({
    fontFamily: GAME_FONT.NAME,
    fontSize: FONT_SIZES.SMALL,
    text,
    color: RED,
    anchor: 0.5,
  });

const createMenuSprites = (menu, textures, animations) => {
  const background = GraphicsCreator.createRectangleSprite({
    width: SCREEN.WIDTH * 1.5,
    height: SCREEN.HEIGHT * 1.5,
    color: BLACK,
    alpha: 0.75,
  });

  const labels = Object.entries(menu).reduce(
    (memo, [key, value]) => ({
      ...memo,
      [key]: new TextSprite({
        fontFamily: GAME_FONT.NAME,
        fontSize: FONT_SIZES.SMALL,
        text: value,
        anchor: [0, 0.5],
      }),
    }),
    {}
  );

  const menuTextures = animations.skull.map(image => textures[image]);

  const icon = new MenuIconSprite(menuTextures, {
    size: Object.values(labels)[0].height * 0.5,
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
