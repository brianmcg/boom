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
  filters,
  utils,
  SCALE_MODES,
  BLEND_MODES,
  settings,
  Rectangle,
  Texture,
  RenderTexture,
  AnimatedSprite,
  Application,
  Container,
  Graphics,
  ParticleContainer,
  Sprite,
  BitmapText,
} from 'pixi.js';

import { Assets } from '@pixi/assets';

import { PixelateFilter } from '@pixi/filter-pixelate';

const { ColorMatrixFilter } = filters;
const { EventEmitter, TextureCache } = utils;

export {
  ColorMatrixFilter,
  EventEmitter,
  SCALE_MODES,
  BLEND_MODES,
  settings,
  Rectangle,
  Texture,
  RenderTexture,
  PixelateFilter,
  AnimatedSprite,
  Application,
  Container,
  TextureCache,
  Graphics,
  ParticleContainer,
  Sprite,
  BitmapText,
  Assets,
};
