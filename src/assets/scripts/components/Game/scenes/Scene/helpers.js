import { Sprite } from '~/core/graphics';

export const createSprites = (resources) => {
  const { data, textures } = resources.scene;
  const { sprites } = data;
  return {
    menu: new Sprite(textures[sprites.menu]),
  };
};
