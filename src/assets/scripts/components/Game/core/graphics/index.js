/**
 * @module graphics.
 */

import * as PIXI from 'pixi.js';
import { PixelateFilter } from '@pixi/filter-pixelate';
import BitmapText from './components/BitmapText';
import Container from './components/Container';
import AnimatedSprite from './components/AnimatedSprite';
import RectangleSprite from './components/RectangleSprite';
import Sprite from './components/Sprite';
import DataLoader from './components/DataLoader';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

PIXI.settings.SPRITE_BATCH_SIZE = 20000;

const {
  Application,
  filters,
} = PIXI;

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
