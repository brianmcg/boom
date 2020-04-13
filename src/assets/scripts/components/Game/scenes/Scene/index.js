import { KEYS } from 'game/core/input';
import { Container } from 'game/core/graphics';
import { SCENE_MUSIC, SCENE_GRAPHICS, SCENE_PATH } from 'game/constants/assets';
import { parse } from './parsers';
import MainContainer from './containers/MainContainer';
import MenuContainer from './containers/MenuContainer';
import PromptContainer from './containers/PromptContainer';

const STATES = {
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

    this.onKeyDown(KEYS.Q, () => {
      if (this.isRunning() || this.isPrompting()) {
        this.showMenu();
      } else if (this.state === STATES.PAUSED) {
        this.hideMenu();
      }
    });

    this.onKeyDown(KEYS.UP_ARROW, () => {
      if (this.isPaused()) {
        this.menuHighlightPrevious();
      }
    });

    this.onKeyDown(KEYS.DOWN_ARROW, () => {
      if (this.isPaused()) {
        this.menuHighlightNext();
      }
    });

    this.onKeyDown(KEYS.ENTER, () => {
      if (this.isPaused()) {
        this.menuSelect();
      }
    });

    this.onKeyDown(KEYS.SPACE, () => {
      if (this.isPrompting()) {
        this.triggerComplete();
      }
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
   * Add a key down event to the scene.
   * @param {String}   name             The name of the key.
   * @param {Function} callback         The callback function.
   * @param {Boolean}  options.replace  Replace existing callback.
   */
  onKeyDown(name, callback, { replace = false } = {}) {
    if (replace) {
      this.game.keyboard.add(name).onKeyDown(callback);
    } else {
      const key = this.game.keyboard.keys[name]
        ? this.game.keyboard.keys[name]
        : this.game.keyboard.add(name);

      key.onKeyDown(callback);
    }
  }

  /**
   * Add a key up callback to the scene.
   * @param {String}   name     The name of the key.
   * @param {Function} callback The callback function.
   */
  onKeyUp(name, callback, { replace = false } = {}) {
    if (replace) {
      this.game.keyboard.add(name).onKeyUp(callback);
    } else {
      const key = this.game.keyboard.keys[name]
        ? this.game.keyboard.keys[name]
        : this.game.keyboard.add(name);

      key.onKeyUp(callback);
    }
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
    this.playSound(this.sounds.highlight);
    this.menuContainer.highlightNext();
  }

  /**
   * Highlight the previous menu item.
   */
  menuHighlightPrevious() {
    this.playSound(this.sounds.highlight);
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
    this.playSound(this.sounds.pause);
  }

  /**
   * Hide the menu.
   */
  hideMenu() {
    this.setUnpausing();
    this.playSound(this.sounds.pause);
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
      // TODO: Enabled music
      this.game.playMusic();
    }

    return isStateChanged;
  }

  /**
   * Handle a state change to running.
   */
  setRunning() {
    const isStateChanged = this.setState(STATES.RUNNING);

    if (isStateChanged) {
      this.game.resumeSounds();
      this.play();
    }

    return isStateChanged;
  }

  /**
   * Set the state to the pausing state.
   */
  setPausing() {
    const isStateChanged = this.setState(STATES.PAUSING);

    if (isStateChanged) {
      this.fadeAmount = 0;
      this.stop();
    }

    return isStateChanged;
  }

  /**
   * Set the state to the paused state.
   */
  setPaused() {
    const isStateChanged = this.setState(STATES.PAUSED);

    if (isStateChanged) {
      this.game.pauseSounds();
    }

    return isStateChanged;
  }

  /**
   * Set the state to the unpausing state.
   */
  setUnpausing() {
    return this.setState(STATES.UNPAUSING);
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
      this.stopSounds();
      this.playSound(this.sounds.complete);
      this.game.fadeMusic();
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
   * Play a sound.
   * @param  {String} type             The type of sound.
   * @param  {String} name             The name of the sound.
   * @param  {Number} options.distance The distance from the player.
   */
  playSound(...options) {
    this.game.playSound(...options);
  }

  /**
   * Stop all sounds.
   */
  stopSounds() {
    this.game.stopSounds();
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
   * Destroy the scene.
   */
  destroy() {
    this.mainContainer.destroy();
    this.menuContainer.destroy();
    this.promptContainer.destroy();
    super.destroy();
  }
}

export default Scene;
