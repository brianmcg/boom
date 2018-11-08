import { Keyboard } from 'game/core/input';
import { SoundPlayer } from 'game/core/audio';
import { Container, Loader } from 'game/core/graphics';
import { SOUNDS } from 'game/constants/sounds';
import LoadingContainer from './containers/LoadingContainer';
import MainContainer from './containers/MainContainer';
import MenuContainer from './containers/MenuContainer';

const STATES = {
  LOADING: 'LOADING',
  FADING_IN: 'FADING_IN',
  FADING_OUT: 'FADING_OUT',
  PAUSED: 'PAUSED',
  RUNNING: 'RUNNING',
  STOPPED: 'STOPPED',
};

const EVENTS = {
  SCENE_COMPLETE: 'SCENE_COMPLETE',
  SCENE_RESTART: 'SCENE_RESTART',
  SCENE_QUIT: 'SCENE_QUIT',
};

const TYPES = {
  TITLE: 'title',
  WORLD: 'world',
  CREDITS: 'credits',
};

const PIXEL = {
  MAX_SIZE: 100,
  INCREMEMENT: 2,
  MIN_SIZE: 1,
  PAUSE_SIZE: 4,
};

/**
 * Class representing a scene.
 */
class Scene extends Container {
  /**
   * Create a Scene.
   * @param  {Number} options.index The index of the scene.
   * @param  {Number} options.scale The scale of the scene.
   */
  constructor({ index = 0, scale = 1 }) {
    super();

    this.index = index;
    this.scale = scale;
    this.loader = new Loader();
    this.loading = new LoadingContainer();
    this.main = new MainContainer();
    this.menu = new MenuContainer();

    this.setState(STATES.LOADING);
    this.addChild(this.loading);
  }


  /**
   * load the scene assets.
   * @return {Object} A promise that assets will be loaded.
   */
  load() {
    const { data, music } = this.assets;

    data.forEach(asset => this.loader.add(...asset));

    SoundPlayer.loadMusic(music)
      .then(() => {
        this.loader.load(this.handleLoad.bind(this));
      });
  }

  /**
   * Handle the load event.
   * @param  {Function} resolve   Resolve the load promise.
   * @param  {Object}   loader    The loader
   * @param  {Object}   resources The loaded resources.
   */
  handleLoad(loader, resources) {
    this.create(resources);
  }

  /**
   * Create the scene.
   */
  create() {
    this.setState(STATES.FADING_IN);
    this.menu.add(this.menuItems);
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
        this.handleStateChangeLoading();
        break;
      case STATES.FADING_IN:
        this.handleStateChangeFadingIn();
        break;
      case STATES.FADING_OUT:
        this.handleStateChangeFadingOut();
        break;
      case STATES.PAUSED:
        this.handleStateChangePaused();
        break;
      case STATES.RUNNING:
        this.handleStateChangeRunning();
        break;
      case STATES.STOPPED:
        this.handleStateChangeStopped();
        break;
      default:
        break;
    }
  }

  /**
   * Update the scene when in a loading state.
   */
  updateLoading() {
    if (this.loading.update) {
      this.loading.update();
    }
  }

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

    if (Keyboard.isPressed(Keyboard.KEYS.ESC)) {
      this.setState(STATES.RUNNING);
      this.removeChild(this.menu);
    }

    if (this.menu.enabled) {
      if (Keyboard.isPressed(Keyboard.KEYS.DOWN_ARROW)) {
        this.menu.highlightNext();
      }

      if (Keyboard.isPressed(Keyboard.KEYS.UP_ARROW)) {
        this.menu.highlightPrevious();
      }

      if (Keyboard.isPressed(Keyboard.KEYS.ENTER)) {
        this.menu.select();
        this.removeChild(this.menu);
      }
    }
  }

  /**
   * Update the scene when in a running state.
   * @param  {Number} delta The delta value.
   */
  updateRunning() {
    if (Keyboard.isPressed(Keyboard.KEYS.ESC)) {
      this.setState(STATES.PAUSED);
      this.addChild(this.menu);
    }
  }

  /**
   * Handle a state change to loading.
   */
  handleStateChangeLoading() {
    this.main.disablePixelFilter();
    this.main.disableColorFilter();
  }

  /**
   * Handle a state change to fading in.
   */
  handleStateChangeFadingIn() {
    SoundPlayer.playMusic();
    this.removeChild(this.loading);
    this.addChild(this.main);
    this.loading.destroy();
    this.main.enablePixelFilter();
    this.main.disableColorFilter();
  }

  /**
   * Handle a state change to fading out.
   */
  handleStateChangeFadingOut() {
    SoundPlayer.playEffect(SOUNDS.WEAPON_DOUBLE_SHOTGUN);
    SoundPlayer.fadeOutMusic();
    this.main.enablePixelFilter();
    this.main.disableColorFilter();
  }

  /**
   * Handle a state change to paused.
   */
  handleStateChangePaused() {
    SoundPlayer.pause();
    SoundPlayer.playEffect(SOUNDS.WEAPON_PISTOL);
    this.main.enablePixelFilter();
    this.main.enableColorFilter();
    this.main.desaturate();
  }

  /**
   * Handle a state change to running.
   */
  handleStateChangeRunning() {
    SoundPlayer.resume();
    this.main.disablePixelFilter();
    this.main.disableColorFilter();
  }

  /**
   * Handle a state change to stopped.
   */
  handleStateChangeStopped() {
    this.main.enablePixelFilter();
    this.main.disableColorFilter();
    this.removeChildren();
    if (this.status) this.emit(this.status, this.type, this.index);
  }

  /**
   * Render the scene.
   */
  render() {
    this.main.setPixelSize(this.pixelSize);

    if (this.menu.enabled) {
      this.menu.render();
    }
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
   * Destroy the scene.
   * @param  {Object} props The destroy options.
   */
  destroy(props) {
    SoundPlayer.unloadMusic();
    super.destroy(props);
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
}

export default Scene;
