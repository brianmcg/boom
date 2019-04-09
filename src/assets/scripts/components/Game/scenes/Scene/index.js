import { Keyboard } from '~/core/input';
import { Container } from '~/core/graphics';
import { SOUNDS } from '~/constants/sounds';
import { SCENE_PATH } from '~/constants/paths';
import { SOUND, DATA } from '~/constants/assets';
import { SCENE_SOUND, SCENE_DATA } from '~/constants/files';
import { STATES, EVENTS, TYPES } from './constants';
import { TEXT } from './text';
import { parse } from './helpers';
import LoadingContainer from './containers/LoadingContainer';
import MainContainer from './containers/MainContainer';
import MenuContainer from './containers/MenuContainer';
import PromptContainer from './containers/PromptContainer';

const { isPressed, resetPressed, KEYS } = Keyboard;

/**
 * Class representing a scene.
 */
export default class Scene extends Container {
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
   * The scene text.
   */
  static get TEXT() { return TEXT; }

  /**
   * Create a Scene.
   * @param  {Number} options.index   The index of the scene.
   * @param  {Number} options.scale   The scale of the scene.
   * @param  {String} options.type    The type of scene.
   * @param  {String} options.sound   The scene music.
   */
  constructor(options) {
    super();

    const {
      index = 0,
      scale = 1,
      type,
      sound,
    } = options;

    const path = `${type}${type === TYPES.WORLD ? `-${index}` : ''}`;

    this.index = index;
    this.scale = scale;
    this.type = type;
    this.sound = sound;

    this.loading = new LoadingContainer();
    this.main = new MainContainer();
    this.prompt = new PromptContainer();

    this.assets = {
      sound: {
        name: SOUND.MUSIC,
        src: `${SCENE_PATH}/${path}/${SCENE_SOUND}`,
      },
      data: [{
        name: DATA.SCENE,
        src: `${SCENE_PATH}/${path}/${SCENE_DATA}`,
      }],
    };

    this.main.once(MainContainer.EVENTS.FADE_IN_COMPLETE, () => {
      this.setState(STATES.RUNNING);
    });

    this.main.once(MainContainer.EVENTS.FADE_OUT_COMPLETE, () => {
      this.setState(STATES.STOPPED);
    });

    this.setState(STATES.LOADING);
  }

  /**
   * Create the scene.
   * @param  {Object} assets The scene assets.
   */
  create(assets) {
    const text = this.menuItems.map(item => item.label);
    const { sprites } = parse({ assets, text });
    this.menu = new MenuContainer({ sprites: sprites.menu });
    this.menu.add(this.menuItems);
    this.setState(STATES.FADING_IN);
  }

  /**
   * Handle a state change.
   * @param  {String} state The new state.
   */
  onStateChange() {
    switch (this.state) {
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
  update(delta) {
    switch (this.state) {
      case STATES.LOADING: this.updateLoading(delta); break;
      case STATES.FADING_IN: this.updateFadingIn(delta); break;
      case STATES.FADING_OUT: this.updateFadingOut(delta); break;
      case STATES.PAUSED: this.updatePaused(delta); break;
      case STATES.RUNNING: this.updateRunning(delta); break;
      case STATES.PROMPTING: this.updatePrompting(delta); break;
      default: break;
    }

    resetPressed();
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
    this.removeChild(this.loading);
    this.addChild(this.main);
    this.sound.play(SOUND.MUSIC);
    this.main.onFadingIn();
    this.loading.destroy();
  }

  /**
   * Handle a state change to fading out.
   */
  onFadingOut() {
    this.sound.play(SOUND.EFFECTS, SOUNDS.WEAPON_DOUBLE_SHOTGUN);
    this.sound.fade(SOUND.MUSIC);
    this.main.onFadingOut();
    this.removeChild(this.prompt);
  }

  /**
   * Handle a state change to paused.
   */
  onPaused() {
    this.sound.pause();
    this.sound.play(SOUND.EFFECTS, SOUNDS.WEAPON_PISTOL);
    this.main.onPaused();
    this.prompt.onPaused();
  }

  /**
   * Handle a state change to running.
   */
  onRunning() {
    this.sound.resume();
    this.main.onRunning();
    this.prompt.onRunning();
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
    if (this.status) {
      this.emit(this.status, this.type, this.index);
    }
  }

  /**
   * Update the scene when in a loading state.
   * @param {Numbmer} delta The delta value.
   */
  updateLoading(delta) {
    this.loading.update(delta);
  }

  /**
   * Update the scene when in a fade in state.
   * @param  {Number} delta The delta value.
   */
  updateFadingIn(delta) {
    this.main.updateFadingIn(delta);
  }

  /**
   * Update the scene when in a fade out state.
   * @param  {Number} delta The delta value.
   */
  updateFadingOut(delta) {
    this.main.updateFadingOut(delta);
  }

  /**
   * Update the scene when in a paused state.
   * @param  {Number} delta The delta value.
   */
  updatePaused(delta) {
    this.main.updatePaused(delta);

    if (isPressed(KEYS.ESC)) {
      this.setState(STATES.RUNNING);
      this.removeChild(this.menu);
    }

    if (this.menu.parent) {
      if (isPressed(KEYS.DOWN_ARROW)) {
        this.menu.highlightNext();
      }

      if (isPressed(KEYS.UP_ARROW)) {
        this.menu.highlightPrevious();
      }

      if (isPressed(KEYS.ENTER)) {
        this.menu.select();
        this.removeChild(this.menu);
      }
    }
  }

  /**
   * Update the scene when in a running state.
   * @param  {Number} delta The delta value.
   */
  updateRunning(...options) {
    if (isPressed(KEYS.ESC)) {
      this.setState(STATES.PAUSED);
      this.addChild(this.menu);
    }

    this.main.updateRunning(...options);
  }

  /**
   * Update the scene when in a prompting state.
   * @param  {Number} delta The delta value.
   */
  updatePrompting(delta) {
    this.updateRunning(delta);

    this.prompt.update(delta);

    if (isPressed(KEYS.SPACE)) {
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
      this.scale.x = scale;
      this.scale.y = scale;
    }
  }

  /**
   * Set the scene state.
   * @param {String} state The new state.
   */
  setState(state) {
    if (this.state !== state) {
      this.state = state;
      this.onStateChange();
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
   */
  destroy() {
    this.main.destroy();
    this.menu.destroy();
    this.prompt.destroy();
    super.destroy();
  }
}
