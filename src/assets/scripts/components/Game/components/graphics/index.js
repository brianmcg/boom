/**
 * @module graphics.
 */

import * as PIXI from 'pixi.js';
import Scene from './components/Scene';
import Application from './components/Application';
import Sprite from './components/Sprite';
import util from './util';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.SPRITE_BATCH_SIZE = 20000;

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
   * The util component.
   */
  util,
};
