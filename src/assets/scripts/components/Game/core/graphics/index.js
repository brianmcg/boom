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
import GraphicsLoader from './components/GraphicsLoader';
import Application from './components/Application';
import EventEmitter from './components/EventEmitter';
import ParticleContainer from './components/ParticleContainer';

settings.SCALE_MODE = SCALE_MODES.NEAREST;

settings.SPRITE_BATCH_SIZE = 20000;

const { ColorMatrixFilter } = filters;

export {
  /**
   * The application component.
   */
  Application,
  /**
   * The scene component.
   */
  Sprite,
  /**
   * The bitmap text component.
   */
  BitmapText,
  /**
   * The color matrix filter component.
   */
  ColorMatrixFilter,
  /**
   * The pixelate filter component.
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
  GraphicsLoader,
  /**
   * The event emitter component.
   */
  EventEmitter,
  /**
   * The particle container component.
   */
  ParticleContainer,
};
