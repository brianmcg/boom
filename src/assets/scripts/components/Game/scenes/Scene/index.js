import { Keyboard } from '~/core/input';
import { SoundPlayer } from '~/core/audio';
import { Container, Loader } from '~/core/graphics';
import { SOUNDS } from '~/constants/sounds';
import { SCENE_PATH } from '~/constants/paths';
import LoadingContainer from './containers/LoadingContainer';
import MainContainer from './containers/MainContainer';
import MenuContainer from './containers/MenuContainer';
import PromptContainer from './containers/PromptContainer';

const STATES = {
  LOADING: 'loading',
  FADING_IN: 'fading:in',
  FADING_OUT: 'fading:out',
  PAUSED: 'paused',
  RUNNING: 'running',
  PROMPTING: 'prompting',
  STOPPED: 'stopped',
};

const EVENTS = {
  COMPLETE: 'complete',
  RESTART: 'restart',
  QUIT: 'quit',
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
   * The scene types class property.
   */
  static get TYPES() { return TYPES; }

  /**
   * The scene states class property.
   */
  static get STATES() { return STATES; }

  /**
   * The scene events class property.
   */
  static get EVENTS() { return EVENTS; }

  /**
   * Create a Scene.
   * @param  {Number} options.index The index of the scene.
   * @param  {Number} options.scale The scale of the scene.
   * @param  {String} options.type  The type of scene.
   */
  constructor({ index = 0, scale = 1, type }) {
    super();

    this.index = index;
    this.scale = scale;
    this.type = type;
    this.loader = new Loader();
    this.loading = new LoadingContainer();
    this.main = new MainContainer();
    this.menu = new MenuContainer();
    this.prompt = new PromptContainer();
    this.path = `${type}${type === TYPES.WORLD ? `-${index}` : ''}`;
    this.sound = SoundPlayer;

    this.main.once(MainContainer.EVENTS.FADE_IN_COMPLETE, () => {
      this.setState(STATES.RUNNING);
    });

    this.main.once(MainContainer.EVENTS.FADE_OUT_COMPLETE, () => {
      this.setState(STATES.STOPPED);
    });

    this.setState(STATES.LOADING);
  }

  /**
   * load the scene assets.
   * @return {Object} A promise that assets will be loaded.
   */
  load() {
    this.loader.add('scene', `${SCENE_PATH}/${this.path}/scene.json`);

    this.sound.loadMusic(`${SCENE_PATH}/${this.path}/scene.mp3`)
      .then(() => {
        this.loader.load(this.onLoad.bind(this));
      });
  }

  /**
   * Handle the load event.
   * @param  {Function} resolve   Resolve the load promise.
   * @param  {Object}   loader    The loader
   * @param  {Object}   resources The loaded resources.
   */
  onLoad(loader, resources) {
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
   * Handle a state change.
   * @param  {String} state The new state.
   */
  onStateChange(state) {
    switch (state) {
      case STATES.LOADING: this.onLoading(); break;
      case STATES.FADING_IN: this.onFadingIn(); break;
      case STATES.FADING_OUT: this.onFadingOut(); break;
      case STATES.PAUSED: this.onPaused(); break;
      case STATES.RUNNING: this.onRunning(); break;
      case STATES.PROMPTING: this.onPrompting(); break;
      case STATES.STOPPED: this.onStopped(); break;
      default: break;
    }
  }

  /**
   * Update the scene.
   * @param  {Number} delta The delta value.
   */
  update(delta, elapsedMS) {
    switch (this.state) {
      case STATES.LOADING: this.updateLoading(delta, elapsedMS); break;
      case STATES.FADING_IN: this.updateFadeIn(delta, elapsedMS); break;
      case STATES.FADING_OUT: this.updateFadeOut(delta, elapsedMS); break;
      case STATES.PAUSED: this.updatePaused(delta, elapsedMS); break;
      case STATES.RUNNING: this.updateRunning(delta, elapsedMS); break;
      case STATES.PROMPTING: this.updatePrompting(delta, elapsedMS); break;
      default: break;
    }
  }

  /**
   * Handle a state change to loading.
   */
  onLoading() {
    this.addChild(this.loading);
    this.main.onLoading();
  }

  /**
   * Handle a state change to fading in.
   */
  onFadingIn() {
    this.sound.playMusic();
    this.removeChild(this.loading);
    this.addChild(this.main);
    this.main.onFadingIn();
    this.loading.destroy(true);
  }

  /**
   * Handle a state change to fading out.
   */
  onFadingOut() {
    this.sound.playEffect(SOUNDS.WEAPON_DOUBLE_SHOTGUN);
    this.sound.fadeOutMusic();
    this.main.onFadingOut();
    this.removeChild(this.prompt);
  }

  /**
   * Handle a state change to paused.
   */
  onPaused() {
    this.sound.pause();
    this.sound.playEffect(SOUNDS.WEAPON_PISTOL);
    this.main.onPaused();
  }

  /**
   * Handle a state change to running.
   */
  onRunning() {
    this.sound.resume();
    this.main.onRunning();
  }

  /**
   * Handle a state change to prompting.
   */
  onPrompting() {
    this.addChild(this.prompt);
  }

  /**
   * Handle a state change to stopped.
   */
  onStopped() {
    this.removeChildren();
    if (this.status) this.emit(this.status, this.type, this.index);
  }

  /**
   * Update the scene when in a loading state.
   */
  updateLoading(delta) {
    this.loading.update(delta);
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

    if (this.menu.parent) {
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

      this.menu.update();
    }
  }

  /**
   * Update the scene when in a running state.
   */
  updateRunning(delta, elapsedMS) {
    this.main.updateRunning(delta, elapsedMS);

    if (Keyboard.isPressed(Keyboard.KEYS.ESC)) {
      this.setState(STATES.PAUSED);
      this.addChild(this.menu);
    }
  }

  /**
   * Update the scene when in a prompting state.
   */
  updatePrompting(delta, elapsedMS) {
    this.prompt.update(delta, elapsedMS);

    if (Keyboard.isPressed(Keyboard.KEYS.SPACE)) {
      this.setStatus(Scene.EVENTS.COMPLETE);
      this.setState(Scene.STATES.FADING_OUT);
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
      this.onStateChange(state);
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
   * @param  {Object} options The destroy options.
   */
  destroy(options) {
    this.sound.unloadMusic();
    super.destroy(options);
  }
}

export default Scene;
