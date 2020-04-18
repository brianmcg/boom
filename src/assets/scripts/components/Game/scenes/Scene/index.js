import { KEYS } from 'game/core/input';
import { Container } from 'game/core/graphics';
import { SoundSpriteController } from 'game/core/audio';
import { SCENE_MUSIC, SCENE_GRAPHICS, SCENE_PATH } from 'game/constants/assets';
import { parse } from './parsers';
import MainContainer from './containers/MainContainer';
import MenuContainer from './containers/MenuContainer';
import PromptContainer from './containers/PromptContainer';
import Controls from './components/Controls';

export const STATES = {
  LOADING: 'loading',
  FADING_IN: 'fading:in',
  FADING_OUT: 'fading:out',
  PAUSING: 'scene:pausing',
  PAUSED: 'paused',
  UNPAUSING: 'scene:unpausing',
  RUNNING: 'running',
  PROMPTING: 'prompting',
  STOPPED: 'stopped',
};

const EVENTS = {
  COMPLETE: 'scene:complete',
  RESTART: 'scene:restart',
  QUIT: 'scene:quit',
};

const PAUSE_INCREMENT = 0.1;

const FADE_INCREMENT = 0.05;

const FADE_PIXEL_SIZE = 80;

const PAUSE_PIXEL_SIZE = 8;

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
    index,
    type,
    game,
    loopMusic = true,
  }) {
    super();

    this.index = index;
    this.type = type;
    this.game = game;

    this.mainContainer = new MainContainer();

    this.path = `${type}${index ? `/${index}` : ''}`;

    this.assets = {
      sound: {
        name: SCENE_MUSIC.NAME,
        src: `${SCENE_PATH}/${this.path}/${SCENE_MUSIC.FILE}`,
        loop: loopMusic,
      },
      graphics: {
        name: SCENE_GRAPHICS,
        src: `${SCENE_PATH}/${this.path}/${SCENE_GRAPHICS}`,
      },
    };

    this.controls = new Controls(this.game);

    this.controls.add(STATES.PAUSED, {
      onKeyDown: {
        [KEYS.Q]: () => this.hideMenu(),
        [KEYS.UP_ARROW]: () => this.menuHighlightPrevious(),
        [KEYS.DOWN_ARROW]: () => this.menuHighlightNext(),
        [KEYS.ENTER]: () => this.menuSelect(),
      },
    });

    this.controls.add(STATES.RUNNING, {
      onKeyDown: {
        [KEYS.Q]: () => this.showMenu(),
      },
    });

    this.controls.add(STATES.PROMPTING, {
      onKeyDown: {
        [KEYS.Q]: () => this.showMenu(),
        [KEYS.SPACE]: () => this.triggerComplete(),
      },
    });

    this.setLoading();
  }

  /**
   * Add mouse move callback.
   * @param {Function} callback The callback.
   */
  onMouseMove(callback) {
    this.game.mouse.onMouseMove(callback);
  }

  /**
   * Add mouse down callback.
   * @param {Function} callback The callback.
   */
  onMouseDown(callback) {
    this.game.mouse.onMouseDown(callback);
  }

  /**
   * Add mouse up callback.
   * @param {Function} callback The callback.
   */
  onMouseUp(callback) {
    this.game.mouse.onMouseUp(callback);
  }

  /**
   * Create the scene.
   * @param  {Object} options.graphics The scene graphics.
   * @param  {Object} options.sounds   The scene sounds.
   */
  create({ graphics, sounds }) {
    const text = {
      menu: this.menu.map(item => item.label),
      prompt: this.promptOption,
    };

    const { sprites } = parse({ graphics, text });

    this.sounds = sounds;

    this.menuContainer = new MenuContainer(sprites.menu);

    this.menuContainer.onSelect(index => this.menu[index].action());

    this.menuContainer.onClose(() => this.setRunning());

    this.promptContainer = new PromptContainer(sprites.prompt);

    this.soundController = new SoundSpriteController({
      sounds: Object.values(this.sounds),
      soundSprite: this.game.soundSprite,
    });

    this.setFadingIn();
  }

  /**
   * Update the scene.
   * @param  {Number} delta The delta value.
   */
  update(delta) {
    switch (this.state) {
      case STATES.FADING_IN:
        this.updateFadingIn(delta);
        break;
      case STATES.RUNNING:
        this.updateRunning(delta);
        break;
      case STATES.PAUSING:
        this.updatePausing(delta);
        break;
      case STATES.PAUSED:
        this.updatePaused(delta);
        break;
      case STATES.UNPAUSING:
        this.updateUnpausing(delta);
        break;
      case STATES.FADING_OUT:
        this.updateFadingOut(delta);
        break;
      default:
        break;
    }

    super.update(delta);
  }

  /**
   * Update the scene when in a fade in state.
   * @param  {Number} delta The delta value.
   */
  updateFadingIn(delta) {
    this.fadeAmount -= FADE_INCREMENT * delta;

    if (this.fadeAmount <= 0) {
      this.fadeAmount = 0;
      this.setRunning();
    }

    this.fade(this.fadeAmount, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  /**
   * Update the scene when in a running state.
   * @param  {Number} delta The delta value.
   */
  updateRunning() {
    this.setPrompting();
  }

  /**
   * Update the scene when in a pausing state.
   * @param  {Number} delta The delta value.
   */
  updatePausing(delta) {
    this.fadeAmount += PAUSE_INCREMENT * delta;

    if (this.fadeAmount >= 1) {
      this.fadeAmount = 1;
      this.setPaused();
    }

    this.fade(this.fadeAmount, {
      pixelSize: PAUSE_PIXEL_SIZE,
    });
  }

  /**
   * Update the scene when in a paused state.
   * @param  {Number} delta The delta value.
   */
  updatePaused() {
    this.fade(this.fadeAmount, {
      pixelSize: PAUSE_PIXEL_SIZE,
    });
  }

  /**
   * Update the scene when in a unpausing state.
   * @param  {Number} delta The delta value.
   */
  updateUnpausing(delta) {
    this.fadeAmount -= PAUSE_INCREMENT * delta;

    if (this.fadeAmount <= 0) {
      this.fadeAmount = 0;
      this.removeChild(this.menuContainer);
    }

    this.fade(this.fadeAmount, {
      pixelSize: PAUSE_PIXEL_SIZE,
    });
  }


  /**
   * Highlight the next menu item.
   */
  menuHighlightNext() {
    this.soundController.emitSound(this.sounds.highlight);
    this.menuContainer.highlightNext();
  }

  /**
   * Highlight the previous menu item.
   */
  menuHighlightPrevious() {
    this.soundController.emitSound(this.sounds.highlight);
    this.menuContainer.highlightPrevious();
  }

  /**
   * Select the next menu item.
   */
  menuSelect() {
    this.menuContainer.select();
    this.hideMenu();
  }

  /**
   * Show the menu.
   */
  showMenu() {
    this.addChild(this.menuContainer);
    this.setPausing();
  }

  /**
   * Hide the menu.
   */
  hideMenu() {
    this.setUnpausing();
  }

  /**
   * Update the scene when in a fade out state.
   * @param  {Number} delta The delta value.
   */
  updateFadingOut(delta) {
    this.fadeAmount += FADE_INCREMENT * delta;

    if (this.fadeAmount >= 1) {
      this.fadeAmount = 1;
      this.setStopped();
    }

    this.fade(this.fadeAmount, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  /**
   * Handle a state change to loading.
   */
  setLoading() {
    return this.setState(STATES.LOADING);
  }

  /**
   * Handle a state change to fading in.
   */
  setFadingIn() {
    const isStateChanged = this.setState(STATES.FADING_IN);

    if (isStateChanged) {
      this.addChild(this.mainContainer);
      this.fadeAmount = 1;
    }

    return isStateChanged;
  }

  /**
   * Handle a state change to running.
   */
  setRunning() {
    const isStateChanged = this.setState(STATES.RUNNING);

    if (isStateChanged) {
      this.play();
      this.game.music.play();
    }

    return isStateChanged;
  }

  /**
   * Set the state to the pausing state.
   */
  setPausing() {
    const isStateChanged = this.setState(STATES.PAUSING);

    if (isStateChanged) {
      this.pause();
      this.game.music.pause();
      this.soundController.emitSound(this.sounds.pause);
      this.fadeAmount = 0;
    }

    return isStateChanged;
  }

  /**
   * Set the state to the paused state.
   */
  setPaused() {
    return this.setState(STATES.PAUSED);
  }

  /**
   * Set the state to the unpausing state.
   */
  setUnpausing() {
    const isStateChanged = this.setState(STATES.UNPAUSING);

    if (isStateChanged) {
      this.soundController.emitSound(this.sounds.pause);
    }

    return isStateChanged;
  }

  /**
   * Handle a state change to prompting.
   */
  setPrompting() {
    const isStateChanged = this.setState(STATES.PROMPTING);

    if (isStateChanged) {
      this.soundController.emitSound(this.sounds.complete);
      this.addChild(this.promptContainer);
    }

    return isStateChanged;
  }

  /**
   * Handle a state change to fading out.
   */
  setFadingOut() {
    const isStateChanged = this.setState(STATES.FADING_OUT);

    if (isStateChanged) {
      this.stop();
      this.soundController.emitSound(this.sounds.complete);
      // this.game.fadeMusic();
    }

    return isStateChanged;
  }

  /**
   * Handle a state change to stopped.
   */
  setStopped() {
    const isStateChanged = this.setState(STATES.STOPPED);

    if (isStateChanged) {
      this.removeChild(this.promptContainer);

      switch (this.stopEvent) {
        case EVENTS.COMPLETE:
          this.complete();
          break;
        case EVENTS.RESTART:
          this.restart();
          break;
        case EVENTS.QUIT:
          this.quit();
          break;
        default:
          break;
      }
    }

    return isStateChanged;
  }

  /**
   * Check if the scene is in the running state.
   * @return {Boolean} The result of the check.
   */
  isRunning() {
    return this.state === STATES.RUNNING;
  }

  /**
   * Check if the scene is in the paused state.
   * @return {Boolean} The result of the check.
   */
  isPaused() {
    return this.state === STATES.PAUSED;
  }

  /**
   * Check if the scene is in the prompting state.
   * @return {Boolean} The result of the check.
   */
  isPrompting() {
    return this.state === STATES.PROMPTING;
  }

  /**
   * Trigger the complete event.
   */
  triggerComplete() {
    this.setStopEvent(EVENTS.COMPLETE);
    this.setFadingOut();
  }

  /**
   * Trigger the restart event.
   */
  triggerRestart() {
    this.setStopEvent(EVENTS.RESTART);
    this.setFadingOut();
  }

  /**
   * Trigger the quit event.
   */
  triggerQuit() {
    this.setStopEvent(EVENTS.QUIT);
    this.setFadingOut();
  }

  /**
   * Resize the scene.
   * @param  {Object} scale The new scale dimensions.
   */
  resize(scale) {
    if (this.state !== STATES.STOPPED) {
      this.setScale(scale);
    }
  }

  /**
   * Set the event to emit when stopped.
   * @param {String} stopEvent The new stopEvent.
   */
  setStopEvent(stopEvent) {
    this.stopEvent = stopEvent;
  }

  /**
   * Set the scene state.
   * @param {String} state The scene state.
   */
  setState(state) {
    const isStateChanged = super.setState(state);

    if (isStateChanged) {
      this.controls.set(state);
    }

    return isStateChanged;
  }

  /**
   * Destroy the scene.
   */
  destroy() {
    this.controls.reset();
    this.mainContainer.destroy();
    this.menuContainer.destroy();
    this.promptContainer.destroy();
    super.destroy();
  }
}

export default Scene;
