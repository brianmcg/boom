import {
  Application,
  Assets,
  ColorMatrixFilter,
  EventEmitter,
  Particle,
  Rectangle,
  TextureStyle,
  ParticleContainer,
  Texture,
  RenderTexture,
} from 'pixi.js';

import { PixelateFilter } from 'pixi-filters';

import AnimatedSprite from './components/AnimatedSprite';
import Container from './components/Container';
import Line from './components/Line';
import Sprite from './components/Sprite';
import TextSprite from './components/TextSprite';
import FadeSprite from './components/FadeSprite';

import GraphicsCreator from './util/GraphicsCreator';
import GraphicsLoader from './util/GraphicsLoader';
import GraphicsCache from './util/GraphicsCache';

TextureStyle.defaultOptions.scaleMode = 'nearest';

export {
  GraphicsCache,
  Texture,
  AnimatedSprite,
  Application,
  Assets,
  ColorMatrixFilter,
  Container,
  EventEmitter,
  FadeSprite,
  GraphicsCreator,
  GraphicsLoader,
  Line,
  Particle,
  ParticleContainer,
  PixelateFilter,
  Rectangle,
  Sprite,
  TextSprite,
  RenderTexture,
};

export type { Anchor } from './types';
export type { AnimatedSpriteOptions } from './components/AnimatedSprite';
export type { FadeSpriteOptions } from './components/FadeSprite';
export type { LineOptions } from './components/Line';
export type { RectangleSpriteOptions } from './components/RectangleSprite';
export type { SpriteOptions } from './components/Sprite';
export type { TextSpriteOptions } from './components/TextSprite';
export type { MaskTextureOptions } from './util/GraphicsCreator';
