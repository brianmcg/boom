import * as PIXI from 'pixi.js';
import { PixelateFilter } from '@pixi/filter-pixelate';
import { Keyboard } from 'game/components/input';
import {
  STATES,
  EVENTS,
  TYPES,
  PIXEL,
  PATHS,
} from './constants';

/**
 * Class representing a scene.
 */
class Scene extends PIXI.Container {
  /**
   * Create a scene.
   */
  constructor(props = {}) {
    super();

    this.state = STATES.LOADING;
    this.filters = [
      new PixelateFilter(PIXEL.MAX_SIZE),
      new PIXI.filters.ColorMatrixFilter(),
    ];

    Object.assign(this, props);
  }

  /**
   * load the scene assets.
   * @return {Object} A promise that assets will be loaded.
   */
  load() {
    return new Promise((resolve) => {
      this.assets.forEach(asset => this.loader.add(...asset));
      this.loader.load(this.onLoad.bind(this, resolve));
    });
  }

  /**
   * Handle the load event.
   * @param  {Function} resolve   Resolve the load promise.
   * @param  {Object}   loader    The loader
   * @param  {Object}   resources The loaded resources.
   */
  onLoad(resolve, loader, resources) {
    this.create(resources);
    resolve(this);
  }

  /**
   * Create the scene.
   * @return {[type]} [description]
   */
  create() {
    this.setState(STATES.FADING_IN);
    this.pixelSize = PIXEL.MAX_SIZE * this.scale.x;
  }

  /**
   * Update the scene.
   * @param  {Number} delta The delta value.
   */
  update(delta) {
    switch (this.state) {
      case STATES.LOADING:
        this.updateLoading(delta);
        break;
      case STATES.FADING_IN:
        this.updateFadeIn(delta);
        break;
      case STATES.FADING_OUT:
        this.updateFadeOut(delta);
        break;
      case STATES.PAUSED:
        this.updatePaused(delta);
        break;
      case STATES.RUNNING:
        this.updateRunning(delta);
        break;
      default:
        break;
    }
  }

  /**
   * Handle a state change.
   * @param  {String} state The new state.
   */
  handleStateChange(state) {
    switch (state) {
      case STATES.LOADING:
        this.filters[0].enabled = false;
        this.filters[1].enabled = false;
        break;
      case STATES.FADING_IN:
        this.filters[0].enabled = true;
        this.filters[1].enabled = false;
        break;
      case STATES.FADING_OUT:
        this.filters[0].enabled = true;
        this.filters[1].enabled = false;
        break;
      case STATES.PAUSED:
        this.filters[0].enabled = true;
        this.filters[1].enabled = true;
        this.filters[1].desaturate();
        break;
      case STATES.RUNNING:
        this.filters[0].enabled = false;
        this.filters[1].enabled = false;
        break;
      case STATES.STOPPED:
        this.filters[0].enabled = true;
        this.filters[1].enabled = false;
        this.removeChildren();
        if (this.status) {
          this.emit(this.status, this.type, this.index);
        }
        break;
      default:
        break;
    }
  }

  updateLoading() {} // eslint-disable-line

  /**
   * Update the scene when in a fade in state.
   * @param  {Number} delta The delta value.
   */
  updateFadeIn(delta) {
    this.pixelSize -= PIXEL.INCREMEMENT * this.scale.x * delta;

    if (this.pixelSize < PIXEL.MIN_SIZE) {
      this.pixelSize = PIXEL.MIN_SIZE;
      this.setState(STATES.RUNNING);
    }
  }

  /**
   * Update the scene when in a fade out state.
   * @param  {Number} delta The delta value.
   */
  updateFadeOut(delta) {
    const maxPixelSize = PIXEL.MAX_SIZE * this.scale.x;

    this.pixelSize += PIXEL.INCREMEMENT * this.scale.x * delta;

    if (this.pixelSize > maxPixelSize) {
      this.pixelSize = maxPixelSize;
      this.setState(STATES.STOPPED);
    }
  }

  /**
   * Update the scene when in a paused state.
   * @param  {Number} delta The delta value.
   */
  updatePaused() {
    this.pixelSize = PIXEL.PAUSE_SIZE * this.scale.x;

    if (this.keyboard.isPressed(Keyboard.KEYS.ESC)) {
      this.setState(STATES.RUNNING);
    }
  }

  /**
   * Update the scene when in a running state.
   * @param  {Number} delta The delta value.
   */
  updateRunning() {
    if (this.keyboard.isPressed(Keyboard.KEYS.ESC)) {
      this.setState(STATES.PAUSED);
    }
  }

  /**
   * Render the scene.
   * @return {[type]} [description]
   */
  render() {
    this.filters[0].size = this.pixelSize;
  }

  /**
   * Resize the scene.
   * @param  {Object} scale The new scale dimensions.
   */
  resize(scale) {
    if (this.state !== STATES.STOPPED) {
      this.scale = scale;
    }
  }

  /**
   * Set the scene state.
   * @param {String} state The new state.
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;
      this.handleStateChange(state);
    }
  }

  /**
   * Set the scene status.
   * @param {String} status The new status.
   */
  setStatus(status) {
    this.status = status;
  }

  /**
   * The scene types constant.
   */
  static get TYPES() {
    return TYPES;
  }

  /**
   * The scene states constant.
   */
  static get STATES() {
    return STATES;
  }

  /**
   * The scene events constant.
   */
  static get EVENTS() {
    return EVENTS;
  }

  /**
   * The scene paths constant.
   */
  static get PATHS() {
    return PATHS;
  }
}

export default Scene;
