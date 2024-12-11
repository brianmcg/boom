import {
  Application,
  Assets,
  ColorMatrixFilter,
  EventEmitter,
  Particle,
  Rectangle,
  TextureStyle,
  ParticleContainer,
  Container as PixiContainer,
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

TextureStyle.defaultOptions.scaleMode = 'nearest';

export {
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
  PixiContainer,
  Rectangle,
  Sprite,
  TextSprite,
};
