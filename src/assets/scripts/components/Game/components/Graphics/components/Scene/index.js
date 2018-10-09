import * as PIXI from 'pixi.js';
import { PixelateFilter } from '@pixi/filter-pixelate';
import {
  STATES,
  EVENTS,
  TYPES,
  PIXEL,
} from './constants';

class Scene extends PIXI.Container {
  constructor(props = {}) {
    super();

    this.state = STATES.LOADING;
    this.filters = [
      new PixelateFilter(PIXEL.MAX_SIZE),
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
    this.pixelSize = PIXEL.MAX_SIZE * this.scale.x;
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
    this.pixelSize -= PIXEL.INCREMEMENT * this.scale.x * delta;

    if (this.pixelSize < PIXEL.MIN_SIZE) {
      this.pixelSize = PIXEL.MIN_SIZE;
      this.setState(STATES.RUNNING);
    }
  }

  updateFadeOut(delta) {
    const maxPixelSize = PIXEL.MAX_SIZE * this.scale.x;

    this.pixelSize += PIXEL.INCREMEMENT * this.scale.x * delta;

    if (this.pixelSize > maxPixelSize) {
      this.pixelSize = maxPixelSize;
      this.setState(STATES.STOPPED);
    }
  }

  updatePaused() {
    this.pixelSize = PIXEL.PAUSE_SIZE * this.scale.x;

    if (this.keyboard.isPressed(this.keyboard.KEYS.ESC)) {
      this.setState(STATES.RUNNING);
    }
  }

  updateRunning() {
    if (this.keyboard.isPressed(this.keyboard.KEYS.ESC)) {
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
    this.filters[0].size = this.pixelSize;
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
          this.keyboard.enabled = false;
          this.filters[0].enabled = false;
          this.filters[1].enabled = false;
          break;
        case STATES.FADING_IN:
          this.keyboard.enabled = false;
          this.filters[0].enabled = true;
          this.filters[1].enabled = false;
          break;
        case STATES.FADING_OUT:
          this.keyboard.enabled = false;
          this.filters[0].enabled = true;
          this.filters[1].enabled = false;
          break;
        case STATES.PAUSED:
          this.keyboard.enabled = true;
          this.filters[0].enabled = true;
          this.filters[1].enabled = true;
          this.filters[1].desaturate();
          break;
        case STATES.RUNNING:
          this.keyboard.enabled = true;
          this.filters[0].enabled = false;
          this.filters[1].enabled = false;
          break;
        case STATES.STOPPED:
          this.keyboard.enabled = false;
          this.filters[0].enabled = true;
          this.filters[1].enabled = false;
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
