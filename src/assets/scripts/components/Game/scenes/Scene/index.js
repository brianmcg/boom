import { KEYS } from 'game/core/input';
import { Container } from 'game/core/graphics';
import { SOUNDS } from 'game/constants/sounds';
import { SCENE_MUSIC, SCENE_GRAPHICS, SCENE_PATH } from 'game/constants/assets';
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

/**
 * Class representing a scene.
 * @class
 */
class Scene extends Container {
  /**
   * Create a Scene.
   * @param  {Number} options.index   The index of the scene.
   * @param  {String} options.type    The type of scene.
   * @param  {String} options.game    The game running the scene.
   */
  constructor({
    index = 0,
    type,
    game,
  }) {
    super();

    this.index = index;
    this.type = type;
    this.game = game;

    this.loadingContainer = new LoadingContainer();
    this.mainContainer = new MainContainer();

    this.path = `${type}${type === TYPES.WORLD ? `/${index}` : ''}`;

    this.assets = {
      sound: {
        name: SCENE_MUSIC,
        src: `${SCENE_PATH}/${this.path}/${SCENE_MUSIC}`,
      },
      graphics: {
        name: SCENE_GRAPHICS,
        src: `${SCENE_PATH}/${this.path}/${SCENE_GRAPHICS}`,
      },
    };

    this.setLoading();
  }

  /**
   * Create the scene.
   * @param  {Object} options.graphics The scene graphics.
   */
  create({ graphics }) {
    const text = {
      menu: this.menuItems.map(item => item.label),
      prompt: this.promptOption,
    };

    const { sprites } = parse({ graphics, text });

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
      case STATES.LOADING: this.updateLoading(delta); break;
      case STATES.FADING_IN: this.updateFadingIn(delta); break;
      case STATES.RUNNING: this.updateRunning(delta); break;
      case STATES.PAUSED: this.updatePaused(delta); break;
      case STATES.PROMPTING: this.updatePrompting(delta); break;
      case STATES.FADING_OUT: this.updateFadingOut(delta); break;
      default: break;
    }
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
    if (this.game.isKeyPressed(KEYS.ESC)) {
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
    if (this.game.isKeyPressed(KEYS.DOWN_ARROW)) {
      this.menuContainer.highlightNext();
    } else if (this.game.isKeyPressed(KEYS.UP_ARROW)) {
      this.menuContainer.highlightPrevious();
    } else if (this.game.isKeyPressed(KEYS.ENTER)) {
      this.menuContainer.select();
      this.removeChild(this.menuContainer);
    } else if (this.game.isKeyPressed(KEYS.ESC)) {
      this.setRunning();
      this.removeChild(this.menuContainer);
    }

    this.mainContainer.updatePauseEffect(delta);
    this.menuContainer.update(delta);
  }

  /**
   * Update the scene when in a prompting state.
   * @param  {Number} delta The delta value.
   */
  updatePrompting(delta) {
    if (this.game.isKeyPressed(KEYS.SPACE)) {
      this.triggerComplete();
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
      // TODO: Enabled music
      // this.game.playMusic();
    }
  }

  /**
   * Handle a state change to running.
   */
  setRunning() {
    if (this.setState(STATES.RUNNING)) {
      this.game.resumeSounds();
      this.mainContainer.play();
      this.promptContainer.play();
    }
  }

  /**
   * Handle a state change to paused.
   */
  setPaused() {
    if (this.setState(STATES.PAUSED)) {
      this.game.pauseSounds();
      this.game.playSound(SOUNDS.WEAPON_PISTOL);
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
      this.game.playSound(SOUNDS.WEAPON_SHOTGUN);
      this.game.fadeMusic();
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
   * Trigger the complete event.
   */
  triggerComplete() {
    this.setStatus(EVENTS.COMPLETE);
    this.setFadingOut();
  }

  /**
   * Trigger the restart event.
   */
  triggerRestart() {
    this.setStatus(EVENTS.RESTART);
    this.setFadingOut();
  }

  /**
   * Trigger the quit event.
   */
  triggerQuit() {
    this.setStatus(EVENTS.QUIT);
    this.setFadingOut();
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
