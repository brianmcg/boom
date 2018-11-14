import { FONT_SIZES } from '~/constants/font';
import { RED } from '~/constants/colors';
import {
  Sprite,
  Texture,
  AnimatedSprite,
  BitmapText,
} from '~/core/graphics';

export const createSprites = (resources) => {
  const { sprites, animations } = resources.scene.data;
  const smokeTextures = animations.smoke.map(image => Texture.fromFrame(image));
  const sparksTextures = animations.sparks.map(image => Texture.fromFrame(image));

  return {
    smoke: new AnimatedSprite(smokeTextures, {
      animationSpeed: 0.2,
      tint: RED,
      loop: true,
      alpha: 0.75,
    }),
    sparks: new AnimatedSprite(sparksTextures, {
      animationSpeed: 0.4,
      loop: true,
    }),
    logo: Sprite.fromFrame(sprites.logo),
    text: new BitmapText({
      font: FONT_SIZES.SMALL,
      text: 'Press space to start',
      color: RED,
    }),
  };
};
