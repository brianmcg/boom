/**
 * @module graphics.
 */

import { settings, SCALE_MODES, filters } from 'pixi.js';
import { PixelateFilter } from '@pixi/filter-pixelate';
import BitmapText from './components/BitmapText';
import Container from './components/Container';
import AnimatedSprite from './components/AnimatedSprite';
import RectangleSprite from './components/RectangleSprite';
import Sprite from './components/Sprite';
import DataLoader from './components/DataLoader';
import Application from './components/Application';

settings.SCALE_MODE = SCALE_MODES.NEAREST;

settings.SPRITE_BATCH_SIZE = 20000;

const { ColorMatrixFilter } = filters;

export {
  /**
   * The Application component.
   */
  Application,
  /**
   * The Scene component.
   */
  Sprite,
  /**
   * The BitmapText component.
   */
  BitmapText,
  /**
   * The color matrix filter.
   */
  ColorMatrixFilter,
  /**
   * The pixelate filter.
   */
  PixelateFilter,
  /**
   * The container component.
   */
  Container,
  /**
   * The animated sprite component.
   */
  AnimatedSprite,
  /**
   * The rectangle sprite components.
   */
  RectangleSprite,
  /**
   * The data loader components.
   */
  DataLoader,
};
