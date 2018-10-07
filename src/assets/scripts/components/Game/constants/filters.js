import * as PIXI from 'pixi.js';
import { PixelateFilter } from '@pixi/filter-pixelate';

export const MAX_PIXEL_SIZE = 100;

export const PIXEL_INCREMEMENT = 2;

export const MIN_PIXEL_SIZE = 1;

export const PIXELATE_INDEX = 0;

export const COLOR_MATRIX_INDEX = 1;

export const PAUSE_PIXEL_SIZE = 2;

export default [
  new PixelateFilter(MAX_PIXEL_SIZE),
  new PIXI.filters.ColorMatrixFilter(),
];
