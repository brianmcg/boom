import { KEYS } from '@game/core/input';
import { Container } from '@game/core/graphics';
import { SoundSpriteController } from '@game/core/audio';
import { MUSIC_VOLUME } from '@game/constants/config';
import { parse } from './parsers';
import MainContainer from './containers/MainContainer';
import MenuContainer from './containers/MenuContainer';
import PromptContainer from './containers/PromptContainer';

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

const FADE_INCREMENT = 0.035;

const FADE_PIXEL_SIZE = 80;

const PAUSE_PIXEL_SIZE = 4;

/**
 * Class representing a scene.
 * @class
 */
class Scene extends Container {
  /**
   * Create a Scene.
   * @param  {String}   options.game        The game running the scene.
   */
  constructor({ game }) {
    super();

    this.game = game;

    this.mainContainer = new MainContainer();

    this.game.input.add(STATES.PAUSED, {
      onKeyDown: {
        [KEYS.Q]: () => this.hideMenu(),
        [KEYS.UP_ARROW]: () => this.menuHighlightPrevious(),
        [KEYS.DOWN_ARROW]: () => this.menuHighlightNext(),
        [KEYS.ENTER]: () => this.menuSelect(),
      },
    });

    this.game.input.add(STATES.RUNNING, {
      onKeyDown: {
        [KEYS.Q]: () => this.showMenu(),
      },
    });

    this.game.input.add(STATES.PROMPTING, {
      onKeyDown: {
        [KEYS.SPACE]: () => this.onPromptInput(),
      },
    });

    this.setLoading();
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

    this.promptContainer = new PromptContainer(sprites.prompt, this.sounds.complete);

    this.soundController = new SoundSpriteController({
      sounds: Object.values(this.sounds),
      soundSprite: this.game.soundSprite,
    });

    this.setFadingIn();
  }

  /**
   * Handle the prompt input.
   */
  onPromptInput() {
    this.soundController.emitSound(this.sounds.complete);
    this.triggerComplete();
  }

  /**
   * Update the scene.
   * @param  {Number} delta The delta value.
   */
  update(delta, elapsedMS) {
    switch (this.state) {
      case STATES.FADING_IN:
        this.updateFadingIn(delta, elapsedMS);
        break;
      case STATES.RUNNING:
        this.updateRunning(delta, elapsedMS);
        break;
      case STATES.PAUSING:
        this.updatePausing(delta, elapsedMS);
        break;
      case STATES.PAUSED:
        this.updatePaused(delta, elapsedMS);
        break;
      case STATES.UNPAUSING:
        this.updateUnpausing(delta, elapsedMS);
        break;
      case STATES.FADING_OUT:
        this.updateFadingOut(delta, elapsedMS);
        break;
      default:
        break;
    }

    super.update(delta, elapsedMS);
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
   * Get the scale of the stage.
   */
  getStageScale() {
    return this.parent.scale.x;
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

      if (this.game.music.isLoaded()) {
        this.game.music.play();
      }
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
      this.game.music.fade(MUSIC_VOLUME, 0, 750);
    }

    return isStateChanged;
  }

  /**
   * Handle a state change to stopped.
   */
  setStopped() {
    const isStateChanged = this.setState(STATES.STOPPED);

    if (isStateChanged) {
      this.game.renderer.clear();

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
   * Move the x coordinate of the container.
   * @param  {Number} x The c x coordinate.
   */
  moveX(x) {
    this.x = x * this.scale.x;
  }

  /**
   * Move the y coordinate of the container.
   * @param  {Number} y The c y coordinate.
   */
  moveY(y) {
    this.y = y * this.scale.y;
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
      this.scale.set(scale);
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
      this.game.input.set(state);
    }

    return isStateChanged;
  }

  /**
   * Destroy the scene.
   */
  destroy(options) {
    this.game.input.reset();
    this.removeChild(this.mainContainer);
    this.removeChild(this.menuContainer);
    this.removeChild(this.promptContainer);
    this.mainContainer.destroy(options);
    this.menuContainer.destroy(options);
    this.promptContainer.destroy(options);
    super.destroy(options);
  }
}

export default Scene;
