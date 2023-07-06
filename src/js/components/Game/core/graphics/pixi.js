/**
 * @module  game/core/graphics/pixi
 */

// import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
// import { EventEmitter, TextureCache } from '@pixi/utils';
// import { SCALE_MODES, BLEND_MODES } from '@pixi/constants';
// import { settings } from '@pixi/settings';
// import { Rectangle } from '@pixi/math';
// import { Texture, RenderTexture } from '@pixi/core';
// import { Container } from '@pixi/display';
// import { AnimatedSprite } from '@pixi/sprite-animated';
// import { Application } from '@pixi/app';
// import { Loader } from '@pixi/loaders';
// import { Graphics } from '@pixi/graphics';
// import { ParticleContainer } from '@pixi/particle-container';
// import { Sprite } from '@pixi/sprite';
// import { BitmapText } from '@pixi/text-bitmap';

import {
  AnimatedSprite,
  Application,
  BitmapText,
  BLEND_MODES,
  Container,
  filters,
  Graphics,
  ParticleContainer,
  Rectangle,
  RenderTexture,
  SCALE_MODES,
  settings,
  Sprite,
  Texture,
  utils,
} from 'pixi.js';

import { Assets } from '@pixi/assets';

import { PixelateFilter } from '@pixi/filter-pixelate';

const { ColorMatrixFilter } = filters;
const { EventEmitter } = utils;

settings.SCALE_MODE = SCALE_MODES.NEAREST;

export {
  AnimatedSprite,
  Application,
  Assets,
  BitmapText,
  BLEND_MODES,
  ColorMatrixFilter,
  Container,
  EventEmitter,
  Graphics,
  ParticleContainer,
  PixelateFilter,
  Rectangle,
  RenderTexture,
  Sprite,
  Texture,
};
