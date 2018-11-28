import { FONT_SIZES } from '~/constants/font';
import { RED } from '~/constants/colors';
import {
  Sprite,
  Texture,
  AnimatedSprite,
  BitmapText,
} from '~/core/graphics';

/**
 * @module helpers.
 */

/**
 * Create sprites from resources.
 * @param  {Object} resources The loaded resources.
 */
export const createSprites = (resources) => {
  const { data, textures } = resources.scene;
  const { animations, sprites } = data;
  const smokeTextures = animations.smoke.map(image => textures[image]);
  const sparksTextures = animations.sparks.map(image => textures[image]);

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
