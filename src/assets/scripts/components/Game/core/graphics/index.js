/**
 * @module graphics.
 */

import * as PIXI from 'pixi.js';
import { PixelateFilter } from '@pixi/filter-pixelate';
import BitmapText from './components/BitmapText';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.SPRITE_BATCH_SIZE = 20000;

const {
  Application,
  Container,
  filters,
  loaders,
  Sprite,
  utils,
} = PIXI;

const { TextureCache } = utils;

const { ColorMatrixFilter } = filters;

const { Loader } = loaders;

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
   * The TextureCache component.
   */
  TextureCache,
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
   * The loader component.
   */
  Loader,
};
