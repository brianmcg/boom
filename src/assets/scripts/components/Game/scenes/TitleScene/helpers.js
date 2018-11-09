import { FONT_SIZES } from 'game/constants/font';
import { RED } from 'game/constants/colors';
import {
  Sprite,
  Texture,
  AnimatedSprite,
  BitmapText,
} from 'game/core/graphics';

export const createSprites = (resources) => {
  const { animations, sprites } = resources.scene.data;
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
