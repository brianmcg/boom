/**
 * @module  game/core/graphics
 */

import {
  ColorMatrixFilter,
  EventEmitter,
  SCALE_MODES,
  BLEND_MODES,
  settings,
  Rectangle,
  Texture,
  RenderTexture,
  PixelateFilter
} from './pixi.js';

import TextSprite from './components/TextSprite';
import Container from './components/Container';
import AnimatedSprite from './components/AnimatedSprite';
import RectangleSprite from './components/RectangleSprite';
import Sprite from './components/Sprite';
import GraphicsLoader from './components/GraphicsLoader';
import Application from './components/Application';
import ParticleContainer from './components/ParticleContainer';
import Line from './components/Line';

export {
  /**
   * The application component.
   */
  Application,
  /**
   * The animated sprite component.
   */
  AnimatedSprite,
  /**
   * The color matrix filter component.
   */
  ColorMatrixFilter,
  /**
   * The container component.
   */
  Container,
  /**
   * The event emitter component.
   */
  EventEmitter,
  /**
   * The graphics loader component.
   */
  GraphicsLoader,
  /**
   * The pixelate filter component.
   */
  PixelateFilter,
  /**
   * The rectangle component.
   */
  Rectangle,
  /**
   * The particle container component.
   */
  ParticleContainer,
  /**
   * The render texture component.
   */
  RenderTexture,
  /**
   * The rectangle sprite component.
   */
  RectangleSprite,
  /**
   * The sprite component.
   */
  Sprite,
  /**
   * The text sprite component.
   */
  TextSprite,
  /**
   * The texture component.
   */
  Texture,
  /**
   * Blend modes constant.
   */
  BLEND_MODES,
  /**
   * Scale modes constant.
   */
  SCALE_MODES,
  /**
   * The line component.
   */
  Line,
  /**
   * PIXI settings.
   */
  settings,
};
