import { Keyboard } from 'game/core/input';
import { Container } from 'game/core/graphics';
import { SOUNDS } from 'game/constants/sounds';
import { SCENE_PATH } from 'game/constants/paths';
import { SOUND, DATA } from 'game/constants/assets';
import { SCENE_SOUND, SCENE_DATA } from 'game/constants/files';
import { parse } from './parsers';
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
  COMPLETE: 'scene:complete',
  RESTART: 'scene:restart',
  QUIT: 'scene:quit',
};

const TYPES = {
  TITLE: 'title',
  WORLD: 'world',
  CREDITS: 'credits',
};

const { isPressed, resetPressed, KEYS } = Keyboard;

/**
 * Class representing a scene.
 * @class
 */
class Scene extends Container {
  /**
   * Create a Scene.
   * @param  {Number} options.index   The index of the scene.
   * @param  {Number} options.scale   The scale of the scene.
   * @param  {String} options.type    The type of scene.
   * @param  {String} options.sound   The scene music.
   */
  constructor({
    index = 0,
    scale = 1,
    type,
    game,
  }) {
    const path = `${type}${type === TYPES.WORLD ? `-${index}` : ''}`;

    super();

    this.index = index;
    this.scale = scale;
    this.type = type;
    this.game = game;

    this.loadingContainer = new LoadingContainer();
    this.mainContainer = new MainContainer();

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

    this.setLoading();
  }

  /**
   * Create the scene.
   * @param  {Object} resources The scene resources.
   */
  create(resources) {
    const text = {
      menu: this.menuItems.map(item => item.label),
      prompt: this.promptOption,
    };

    const { sprites } = parse(resources, text);

    this.menuContainer = new MenuContainer({
      sprites: sprites.menu,
      items: this.menuItems,
    });

    this.promptContainer = new PromptContainer(sprites.prompt);

    this.setFadingIn();
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
        this.updateFadingIn(delta);
        break;
      case STATES.RUNNING:
        this.updateRunning(delta);
        break;
      case STATES.PAUSED:
        this.updatePaused(delta);
        break;
      case STATES.PROMPTING:
        this.updatePrompting(delta);
        break;
      case STATES.FADING_OUT:
        this.updateFadingOut(delta);
        break;
      default: break;
    }

    resetPressed();
  }

  /**
   * Update the scene when in a loading state.
   * @param {Numbmer} delta The delta value.
   */
  updateLoading(delta) {
    this.loadingContainer.update(delta);
  }

  /**
   * Update the scene when in a fade in state.
   * @param  {Number} delta The delta value.
   */
  updateFadingIn(delta) {
    this.mainContainer.updateFadeInEffect(delta);
  }

  /**
   * Update the scene when in a running state.
   * @param  {Number} delta The delta value.
   */
  updateRunning(delta) {
    if (isPressed(KEYS.ESC)) {
      this.setPaused();
      this.addChild(this.menuContainer);
    }

    this.mainContainer.update(delta);
  }

  /**
   * Update the scene when in a paused state.
   * @param  {Number} delta The delta value.
   */
  updatePaused(delta) {
    if (isPressed(KEYS.DOWN_ARROW)) {
      this.menuContainer.highlightNext();
    } else if (isPressed(KEYS.UP_ARROW)) {
      this.menuContainer.highlightPrevious();
    } else if (isPressed(KEYS.ENTER)) {
      this.menuContainer.select();
      this.removeChild(this.menuContainer);
    } else if (isPressed(KEYS.ESC)) {
      this.setRunning();
      this.removeChild(this.menuContainer);
    }

    this.mainContainer.updatePauseEffect(delta);
  }

  /**
   * Update the scene when in a prompting state.
   * @param  {Number} delta The delta value.
   */
  updatePrompting(delta) {
    if (isPressed(KEYS.SPACE)) {
      this.setStatus(Scene.EVENTS.COMPLETE);
      this.setFadingOut();
    }

    this.promptContainer.update(delta);
  }

  /**
   * Update the scene when in a fade out state.
   * @param  {Number} delta The delta value.
   */
  updateFadingOut(delta) {
    this.mainContainer.updateFadeOutEffect(delta);
  }

  /**
   * Handle a state change to loading.
   */
  setLoading() {
    if (this.setState(STATES.LOADING)) {
      this.addChild(this.loadingContainer);
    }
  }

  /**
   * Handle a state change to fading in.
   */
  setFadingIn() {
    if (this.setState(STATES.FADING_IN)) {
      this.removeChild(this.loadingContainer);
      this.addChild(this.mainContainer);
      this.mainContainer.initFadeInEffect();
      this.loadingContainer.destroy();
      this.game.sound.play(SOUND.MUSIC);
    }
  }

  /**
   * Handle a state change to running.
   */
  setRunning() {
    if (this.setState(STATES.RUNNING)) {
      this.game.sound.resume();
      this.mainContainer.play();
      this.promptContainer.play();
    }
  }

  /**
   * Handle a state change to paused.
   */
  setPaused() {
    if (this.setState(STATES.PAUSED)) {
      this.game.sound.pause();
      this.game.sound.play(SOUND.EFFECTS, SOUNDS.WEAPON_PISTOL);
      this.mainContainer.stop();
      this.promptContainer.stop();
    }
  }

  /**
   * Handle a state change to prompting.
   */
  setPrompting() {
    if (this.setState(STATES.PROMPTING)) {
      this.addChild(this.promptContainer);
    }
  }

  /**
   * Handle a state change to fading out.
   */
  setFadingOut() {
    if (this.setState(STATES.FADING_OUT)) {
      this.game.sound.play(SOUND.EFFECTS, SOUNDS.WEAPON_DOUBLE_SHOTGUN);
      this.game.sound.fade(SOUND.MUSIC);
      this.mainContainer.initFadeOutEffect();
      this.removeChild(this.promptContainer);
    }
  }

  /**
   * Handle a state change to stopped.
   */
  setStopped() {
    if (this.setState(STATES.STOPPED)) {
      switch (this.status) {
        case EVENTS.COMPLETE: this.complete(); break;
        case EVENTS.RESTART: this.restart(); break;
        case EVENTS.QUIT: this.quit(); break;
        default: break;
      }
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

      return true;
    }

    return false;
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
    this.mainContainer.destroy();
    this.menuContainer.destroy();
    this.promptContainer.destroy();
    super.destroy();
  }

  /**
   * The scene types class property.
   */
  static get TYPES() {
    return TYPES;
  }

  /**
   * The scene states class property.
   */
  static get STATES() {
    return STATES;
  }

  /**
   * The scene events class property.
   */
  static get EVENTS() {
    return EVENTS;
  }
}

export default Scene;
