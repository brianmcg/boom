/**
 * @module graphics.
 */

import * as PIXI from 'pixi.js';
import Scene from './components/Scene';
import BitmapText from './components/BitmapText';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.SPRITE_BATCH_SIZE = 20000;

const { Application, Sprite, utils } = PIXI;

const { TextureCache } = utils;

export {
  /**
   * The Application component.
   */
  Application,
  /**
   * The Scene component.
   */
  Scene,
  /**
   * The Sprite component.
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
};
