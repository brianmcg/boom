import { KEYS } from 'game/core/input';
import { Container } from 'game/core/graphics';
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

    this.loadingContainer = new LoadingContainer();
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

    this.setLoading();

    // this.input.onKeyDown(() => this.onKeyDown());
  }

  onKeyDown(key) {
    if (this.isRunning()) {
      switch (key) {
        case KEYS.ESC:
          this.showMenu();
          break;
        default:
          break;
      }
    }

    if (this.isPaused()) {
      switch (key) {
        case KEYS.DOWN_ARROW:
          this.menuHighlightNext();
          break;
        case KEYS.UP_ARROW:
          this.menuHighlightPrevious();
          break;
        case KEYS.ENTER:
          this.menuSelect();
          break;
        case KEYS.ESC:
          this.hideMenu();
          break;
        default:
          break;
      }
    }
  }

  /**
   * Create the scene.
   * @param  {Object} options.graphics The scene graphics.
   * @param  {Object} options.sounds   The scene sounds.
   */
  create({ graphics, sounds }) {
    const text = {
      menu: this.menuItems.map(item => item.label),
      prompt: this.promptOption,
    };

    const { sprites } = parse({ graphics, text });

    this.sounds = sounds;

    this.menuContainer = new MenuContainer(sprites.menu);

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
      case STATES.PROMPTING:
        this.updatePrompting(delta);
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
    if (this.isKeyPressed(KEYS.ESC)) {
      this.showMenu();
    }

    if (this.selectedOption) {
      this.selectedOption();
    }
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
    if (this.isKeyPressed(KEYS.DOWN_ARROW)) {
      this.menuHighlightNext();
    } else if (this.isKeyPressed(KEYS.UP_ARROW)) {
      this.menuHighlightPrevious();
    } else if (this.isKeyPressed(KEYS.ENTER)) {
      this.menuSelect();
    } else if (this.isKeyPressed(KEYS.ESC)) {
      this.hideMenu();
    }

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
      this.setRunning();
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
    this.selectedOption = this.menuItems[this.menuContainer.index].action;
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
   * Update the scene when in a prompting state.
   * @param  {Number} delta The delta value.
   */
  updatePrompting() {
    if (this.isKeyPressed(KEYS.SPACE)) {
      this.triggerComplete();
    }
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
    const isStateChanged = this.setState(STATES.LOADING);

    if (isStateChanged) {
      this.addChild(this.loadingContainer);
    }

    return isStateChanged;
  }

  /**
   * Handle a state change to fading in.
   */
  setFadingIn() {
    const isStateChanged = this.setState(STATES.FADING_IN);

    if (isStateChanged) {
      this.removeChild(this.loadingContainer);
      this.addChild(this.mainContainer);
      this.fadeAmount = 1;
      this.loadingContainer.destroy();
      // TODO: Enabled music
      // this.game.playMusic();
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
      this.selectedOption = null;
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
   * Check if a key pressed.
   * @param  {String}  key The key to check.
   * @return {Boolean}     The key is pressed.
   */
  isKeyPressed(key) {
    return this.game.isKeyPressed(key);
  }

  /**
   * Check if a key held down.
   * @param  {String}  key The key to check.
   * @return {Boolean}     The key is held down.
   */
  isKeyHeld(key) {
    return this.game.isKeyHeld(key);
  }

  /**
   * Check if the mouse button is held down.
   * @return {Boolean} The mouse button is held down.
   */
  isMouseButtonHeld() {
    return this.game.isMouseButtonHeld();
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
