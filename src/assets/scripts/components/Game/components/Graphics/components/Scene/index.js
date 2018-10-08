import * as PIXI from 'pixi.js';
import { PixelateFilter } from '@pixi/filter-pixelate';
import { STATES, EVENTS, TYPES } from './constants';

const MAX_PIXEL_SIZE = 100;

const PIXEL_INCREMEMENT = 2;

const MIN_PIXEL_SIZE = 1;

const PIXELATE_INDEX = 0;

const COLOR_MATRIX_INDEX = 1;

const PAUSE_PIXEL_SIZE = 4;

class Scene extends PIXI.Container {
  constructor(props = {}) {
    super();

    this.state = STATES.LOADING;
    this.filters = [
      new PixelateFilter(MAX_PIXEL_SIZE),
      new PIXI.filters.ColorMatrixFilter(),
    ];

    Object.assign(this, props);
  }

  load() {
    return new Promise((resolve) => {
      this.assets.forEach(asset => this.loader.add(...asset));
      this.loader.load(this.onLoad.bind(this, resolve));
    });
  }

  onLoad(resolve, loader, resources) {
    this.create(resources);
    resolve(this);
  }

  create() {
    this.setState(STATES.FADING_IN);
    this.pixelSize = MAX_PIXEL_SIZE * this.scale.x;
  }

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
      case STATES.STOPPED:
        this.updateStopped();
        break;
      default:
        break;
    }
  }

  updateLoading() {} // eslint-disable-line

  updateFadeIn(delta) {
    this.pixelSize -= PIXEL_INCREMEMENT * this.scale.x * delta;

    if (this.pixelSize < MIN_PIXEL_SIZE) {
      this.pixelSize = MIN_PIXEL_SIZE;
      this.setState(STATES.RUNNING);
    }
  }

  updateFadeOut(delta) {
    const maxPixelSize = MAX_PIXEL_SIZE * this.scale.x;

    this.pixelSize += PIXEL_INCREMEMENT * this.scale.x * delta;

    if (this.pixelSize > maxPixelSize) {
      this.pixelSize = maxPixelSize;
      this.setState(STATES.STOPPED);
    }
  }

  updatePaused() {
    this.pixelSize = PAUSE_PIXEL_SIZE * this.scale.x;

    if (this.input.isKeyPressed(this.input.KEYS.ESC)) {
      this.setState(STATES.RUNNING);
    }
  }

  updateRunning() {
    if (this.input.isKeyPressed(this.input.KEYS.ESC)) {
      this.setState(STATES.PAUSED);
    }
  }

  updateStopped() {
    this.removeChildren();

    if (this.status) {
      this.emit(this.status, this.type);
    }
  }

  render() {
    this.filters[PIXELATE_INDEX].size = this.pixelSize;
  }

  resize(scale) {
    if (this.state !== STATES.STOPPED) {
      this.scale = scale;
    }
  }

  stop() {
    this.setState(STATES.FADING_OUT);
  }

  setState(state) {
    if (this.state !== state) {
      switch (state) {
        case STATES.LOADING:
          this.input.enabled = false;
          this.filters[PIXELATE_INDEX].enabled = false;
          this.filters[COLOR_MATRIX_INDEX].enabled = false;
          break;
        case STATES.FADING_IN:
          this.input.enabled = false;
          this.filters[PIXELATE_INDEX].enabled = true;
          this.filters[COLOR_MATRIX_INDEX].enabled = false;
          break;
        case STATES.FADING_OUT:
          this.input.enabled = false;
          this.filters[PIXELATE_INDEX].enabled = true;
          this.filters[COLOR_MATRIX_INDEX].enabled = false;
          break;
        case STATES.PAUSED:
          this.input.enabled = true;
          this.filters[PIXELATE_INDEX].enabled = true;
          this.filters[COLOR_MATRIX_INDEX].enabled = true;
          this.filters[COLOR_MATRIX_INDEX].desaturate();
          break;
        case STATES.RUNNING:
          this.input.enabled = true;
          this.filters[PIXELATE_INDEX].enabled = false;
          this.filters[COLOR_MATRIX_INDEX].enabled = false;
          break;
        case STATES.STOPPED:
          this.input.enabled = false;
          this.filters[PIXELATE_INDEX].enabled = true;
          this.filters[COLOR_MATRIX_INDEX].enabled = false;
          break;
        default:
          break;
      }

      this.state = state;
    }
  }

  setStatus(status) {
    this.status = status;
  }

  static get TYPES() {
    return TYPES;
  }

  static get STATES() {
    return STATES;
  }

  static get EVENTS() {
    return EVENTS;
  }
}

export default Scene;
