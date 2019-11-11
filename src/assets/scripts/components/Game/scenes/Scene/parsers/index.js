import { TextSprite, RectangleSprite } from 'game/core/graphics';
import { FONT_SIZES } from 'game/constants/fonts';
import { WHITE, RED, BLACK } from 'game/constants/colors';
import { SCREEN } from 'game/constants/config';
import MenuSprite from '../sprites/MenuSprite';

const createPromptSprite = text => (
  new TextSprite({
    font: FONT_SIZES.SMALL,
    text,
    color: RED,
  })
);

const createMenuSprites = (menu, textures, animations) => {
  const background = new RectangleSprite({
    width: SCREEN.WIDTH,
    height: SCREEN.HEIGHT,
    color: BLACK,
    alpha: 0.75,
  });

  const labels = menu.reduce((memo, key, index) => ({
    ...memo,
    [key]: new TextSprite({
      font: FONT_SIZES.SMALL,
      text: key,
      color: index ? WHITE : RED,
    }),
  }), {});

  const iconHeight = labels[Object.keys(labels)[0]].height;
  const menuTextures = animations.menu.map(image => textures[image]);
  const icon = new MenuSprite(menuTextures);

  icon.height = iconHeight;
  icon.width = iconHeight;

  return {
    icon,
    labels,
    background,
  };
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
