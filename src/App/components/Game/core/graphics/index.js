import {
  Application,
  Assets,
  ColorMatrixFilter,
  EventEmitter,
  Particle,
  Rectangle,
  TextureStyle,
  ParticleContainer,
} from 'pixi.js';

import { PixelateFilter } from 'pixi-filters';

import AnimatedSprite from './components/AnimatedSprite';
import Container from './components/Container';
import Line from './components/Line';
import Sprite from './components/Sprite';
import TextSprite from './components/TextSprite';

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
  GraphicsCreator,
  GraphicsLoader,
  Line,
  Particle,
  ParticleContainer,
  PixelateFilter,
  Rectangle,
  Sprite,
  TextSprite,
};
