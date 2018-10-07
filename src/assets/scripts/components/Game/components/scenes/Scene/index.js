import * as PIXI from 'pixi.js';
import SCENE_FILTERS, {
  MAX_PIXEL_SIZE,
  MIN_PIXEL_SIZE,
  PAUSE_PIXEL_SIZE,
  PIXEL_INCREMEMENT,
  PIXELATE_INDEX,
} from '../../../constants/filters';
import {
  LOADING,
  FADING_IN,
  FADING_OUT,
  PAUSED,
  RUNNING,
  STOPPED,
} from '../../../constants/scene-states';

class Scene extends PIXI.Container {
  constructor(props = {}) {
    super();

    this.state = LOADING;
    this.filters = SCENE_FILTERS;

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
    this.setState(FADING_IN);
    this.pixelSize = MAX_PIXEL_SIZE * this.scale.x;
  }

  update(delta) {
    switch (this.state) {
      case LOADING:
        this.updateLoading(delta);
        break;
      case FADING_IN:
        this.updateFadeIn(delta);
        break;
      case FADING_OUT:
        this.updateFadeOut(delta);
        break;
      case PAUSED:
        this.updatePaused(delta);
        break;
      case RUNNING:
        this.updateRunning(delta);
        break;
      case STOPPED:
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
      this.setState(RUNNING);
    }
  }

  updateFadeOut(delta) {
    const maxPixelSize = MAX_PIXEL_SIZE * this.scale.x;

    this.pixelSize += PIXEL_INCREMEMENT * this.scale.x * delta;

    if (this.pixelSize > maxPixelSize) {
      this.pixelSize = maxPixelSize;
      this.setState(STOPPED);
    }
  }

  updatePaused(delta) {
    this.pixelSize = PAUSE_PIXEL_SIZE * this.scale.x * delta;
  }

  updateRunning() {} // eslint-disable-line

  updateStopped() {
    this.removeChildren();

    if (this.status) {
      this.events.emit(this.status, this.type);
    }
  }

  render() {
    this.filters[PIXELATE_INDEX].size = this.pixelSize;
  }

  resize(scale) {
    if (this.state !== STOPPED) {
      this.scale = scale;
    }
  }

  stop() {
    this.setState(FADING_OUT);
  }

  setState(state) {
    switch (state) {
      case LOADING:
        this.input.enabled = false;
        this.filters[PIXELATE_INDEX].enabled = false;
        break;
      case FADING_IN:
        this.input.enabled = false;
        this.filters[PIXELATE_INDEX].enabled = true;
        break;
      case FADING_OUT:
        this.input.enabled = false;
        this.filters[PIXELATE_INDEX].enabled = true;
        break;
      case PAUSED:
        this.input.enabled = true;
        this.filters[PIXELATE_INDEX].enabled = true;
        break;
      case RUNNING:
        this.input.enabled = true;
        this.filters[PIXELATE_INDEX].enabled = false;
        break;
      case STOPPED:
        this.input.enabled = false;
        this.filters[PIXELATE_INDEX].enabled = true;
        break;
      default:
        break;
    }

    this.state = state;
  }

  setStatus(status) {
    this.status = status;
  }
}

export default Scene;
