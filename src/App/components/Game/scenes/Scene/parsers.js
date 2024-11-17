/**
 * @module game/scenes/scene/parsers
 */

import { TextSprite, GraphicsCreator } from '@game/core/graphics';
import { GAME_FONT } from '@constants/assets';
import { FONT_SIZES } from '@constants/fonts';
import { WHITE, RED, BLACK } from '@constants/colors';
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

  const labels = menu.reduce(
    (memo, key, index) => [
      ...memo,
      new TextSprite({
        fontFamily: GAME_FONT.NAME,
        fontSize: FONT_SIZES.SMALL,
        text: key.toUpperCase(),
        color: index ? WHITE : RED,
      }),
    ],
    []
  );

  const menuTextures = animations.skull.map(image => textures[image]);

  const icon = new MenuIconSprite(menuTextures, {
    size: labels[0].height,
  });

  return { icon, labels, background };
};

/**
 * Parses the loaded scene assets.
 * @param  {Object} options.graphics  The scene graphics.
 * @param  {Array}  options.text      The scene text.
 * @return {Object}                   The parsed scene data.
 */
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
