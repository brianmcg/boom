import { Keyboard } from '~/core/input';
import { SoundPlayer } from '~/core/audio';
import { Container, Loader } from '~/core/graphics';
import { SOUNDS } from '~/constants/sounds';
import LoadingContainer from './containers/LoadingContainer';
import MainContainer from './containers/MainContainer';
import MenuContainer from './containers/MenuContainer';
import PromptContainer from './containers/PromptContainer';

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
    this.prompt = new PromptContainer();

    this.main.on(MainContainer.EVENTS.FADE_IN_COMPLETE, () => {
      this.setState(STATES.RUNNING);
    });

    this.main.on(MainContainer.EVENTS.FADE_OUT_COMPLETE, () => {
      this.setState(STATES.STOPPED);
    });

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
  }

  /**
   * Update the scene.
   * @param  {Number} delta The delta value.
   */
  update(delta, elapsedMS) {
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
        this.updateRunning(delta, elapsedMS);
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
    this.loading.update();
  }

  /**
   * Update the scene when in a fade in state.
   * @param  {Number} delta The delta value.
   */
  updateFadeIn(delta) {
    this.main.updateFadeIn(delta);
  }

  /**
   * Update the scene when in a fade out state.
   * @param  {Number} delta The delta value.
   */
  updateFadeOut(delta) {
    this.main.updateFadeOut(delta);
  }

  /**
   * Update the scene when in a paused state.
   * @param  {Number} delta The delta value.
   */
  updatePaused(delta) {
    this.main.updatePaused(delta);

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
    this.children.forEach(child => child.render());
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
