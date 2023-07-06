/**
 * @module game/scenes/scene/parsers
 */

import { TextSprite, RectangleSprite } from '@game/core/graphics';
import { GAME_FONT } from '@game/constants/assets';
import { FONT_SIZES } from '@game/constants/fonts';
import { WHITE, RED, BLACK } from '@game/constants/colors';
import { SCREEN } from '@game/constants/config';
import MenuIconSprite from '../sprites/MenuIconSprite';

const createPromptSprite = text =>
  new TextSprite({
    fontName: GAME_FONT.NAME,
    fontSize: FONT_SIZES.SMALL,
    text,
    color: RED,
    anchor: 0.5,
  });

const createMenuSprites = (menu, textures, animations) => {
  const background = new RectangleSprite({
    width: SCREEN.WIDTH * 1.5,
    height: SCREEN.HEIGHT * 1.5,
    color: BLACK,
    alpha: 0.75,
  });

  const labels = menu.reduce(
    (memo, key, index) => [
      ...memo,
      new TextSprite({
        fontName: GAME_FONT.NAME,
        fontSize: FONT_SIZES.SMALL,
        text: key,
        color: index ? WHITE : RED,
        anchor: 0.5,
      }),
    ],
    [],
  );

  const menuTextures = animations.skull.map(image => textures[image]);

  const icon = new MenuIconSprite(menuTextures, {
    anchor: 0.5,
    size: labels[Object.keys(labels)[0]].height,
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
