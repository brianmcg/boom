/**
 * @module  game/core/graphics
 */

import {
  ColorMatrixFilter,
  EventEmitter,
  BLEND_MODES,
  Rectangle,
  Texture,
  RenderTexture,
  PixelateFilter,
  Assets,
} from './pixi';

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
   * The line component.
   */
  Line,
  /**
   * The Assets component.
   */
  Assets,
};
